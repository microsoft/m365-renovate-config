/** @import { ConfigData, LocalPresetData, RenovateLog } from './utils/types.js' */

import assert from 'assert';
import fs from 'fs';
import jju from 'jju';
import path from 'path';
import { Transform } from 'stream';
import { getLocalPresetFromExtends } from './utils/extends.js';
import { formatFileContents } from './utils/formatFile.js';
import {
  isGithub,
  logEndGroup,
  logError,
  logOther,
  logGroup,
  repoRenovateConfigPath,
} from './utils/github.js';
import { readPresetsAndConfigs, specialConfigNames } from './utils/readPresets.js';
import { formatRenovateLog } from './utils/renovateLogs.js';
import { runBin } from './utils/runBin.js';

const presetArg = process.argv
  .find((arg) => arg.startsWith('--preset='))
  ?.split('=')[1]
  .replace(/^(['"])(.*)\1$/, '$2');

/** @typedef {'error'|'unknown'|'ok'} Result */
/** */

/**
 * Validate a preset or config file.
 * @param {ConfigData} preset
 * @param {boolean} hasInvalidRepoConfig
 * @returns {Promise<Result>}
 */
async function checkFile(preset, hasInvalidRepoConfig) {
  const { absolutePath, filename } = preset;

  // Use renovate-config-validator to test for blatantly invalid configuration
  // and for configs needing migration.
  const configProcess = runBin('renovate-config-validator', [], {
    quiet: true,
    env: {
      RENOVATE_CONFIG_FILE: absolutePath,
      LOG_LEVEL: 'warn',
      LOG_FORMAT: 'json', // log as JSON to make it easier to determine if migration is needed
    },
  });

  let migratedConfig;
  let newConfig;
  let errorMessages = /** @type {Set<string>} */ (new Set());
  // Format the JSON logs as nice text (to be sent to stdout) and detect special properties,
  // including `migratedConfig` (or `newConfig`) indicating that the config needs migration
  const logTransform = new Transform({
    transform(chunk, encoding, callback) {
      /** @type {RenovateLog} */
      let logJson;
      try {
        logJson = JSON.parse(chunk.toString());
      } catch {
        return callback(null, chunk.toString());
      }

      if (logJson.migratedConfig) {
        // Config migration message
        migratedConfig = logJson.migratedConfig;
        callback(null, '');
      } else if (logJson.newConfig) {
        // Alternate config migration message...?
        // (not sure why it's logged twice, but capture both in case it changes in the future)
        newConfig = logJson.newConfig;
        callback(null, '');
      } else if (logJson.errors?.[0]?.message) {
        // The errors are from this preset/config, so save them to log later
        // (for the repo config it logs the same errors twice, so use a set)
        for (const error of logJson.errors) {
          errorMessages.add(error.message);
        }
        callback(null, '');
      } else {
        // Unknown log
        callback(null, formatRenovateLog(logJson, true) + '\n');
      }
    },
  });

  // Redirect formatted logs to stdout, and wait for the process
  configProcess.all?.pipe(logTransform).pipe(process.stdout);
  const processFailed = (await configProcess).failed;

  if (errorMessages.size > 0) {
    logError(
      `❌ Found errors in ${filename}:\n` +
        [...errorMessages].map((msg) => `    - ${msg}`).join('\n'),
      filename,
    );
    return 'error';
  }

  if (processFailed) {
    // No errors specific to this preset were logged in the expected format, but the process
    // exited non-0. If the repo config also failed to validate, that's probably why.
    // Otherwise it's hard to say or might be a bug in this test.
    if (hasInvalidRepoConfig) {
      logOther(
        'warning',
        `Validation exited non-0, but this was probably due to repo config errors. ` +
          'See logs for details.',
        filename,
      );
      return 'unknown';
    }

    logError(`Unknown error validating ${filename}. See logs for details.`, filename);
    return 'error';
  }

  const updatedConfig = migratedConfig || newConfig;
  if (updatedConfig) {
    if (preset.json && preset.content) {
      return migrateConfig(/** @type {LocalPresetData} */ (preset), updatedConfig);
    }

    // The server config can't be auto-migrated because it's JS
    logError(
      `❌ ${filename} requires migration, but must be updated manually (see logs).`,
      filename,
    );
    console.log(JSON.stringify(updatedConfig, null, 2));
    return 'error';
  }

  return 'ok';
}

/**
 * Write migrated config content to a file and format it if appropriate.
 * @param {LocalPresetData} preset
 * @param {*} migratedConfig
 * @returns {Promise<Result>}
 */
async function migrateConfig(preset, migratedConfig) {
  const { name, filename, absolutePath, content } = preset;
  const migratedContent = jju.update(content, migratedConfig, {
    indent: 2,
    mode: path.extname(filename) === '.json5' ? 'cjson' : 'json',
  });

  // Update the file if running locally or this is the repo config (to prevent others from failing).
  // There's no point in updating other configs in CI since they can't be committed.
  const isRepoConfig = name === specialConfigNames.repoConfig;
  let result = /** @type {Result} */ ('ok');

  if (isGithub) {
    result = 'error';
    // Log errors for CI
    logError(
      `❌ ${filename} requires migration.\n` +
        (isRepoConfig
          ? 'This will be done locally in CI so the other presets can be validated, but you '
          : 'You ') +
        'must update this config by either running this test locally or manually copying the following content.',
      filename,
    );
    console.log(migratedContent);
  }

  if (!isGithub || isRepoConfig) {
    // Actually update and format the file
    console.log(`Migrating ${filename} (see git diff for details)`);
    try {
      const formattedContent = await formatFileContents(absolutePath, migratedContent);
      fs.writeFileSync(absolutePath, formattedContent);
    } catch (err) {
      logError(err);
      result = 'error';
    }
  }

  return result;
}

/**
 * Check the validity of any preset `extends` values that point to local presets.
 * (This is useful when renaming things.)
 * DOES NOT check the validity of built-in or other remote presets.
 * @param {ConfigData} preset
 * @param {string[]} presetNames
 * @returns {Exclude<Result,'warn'>}
 */
function checkExtends(preset, presetNames) {
  const { json, filename } = preset;
  if (!json || !json.extends) {
    return 'ok';
  }

  const invalidExtends = json.extends.filter((ext) => {
    const extPreset = getLocalPresetFromExtends(ext);
    return extPreset && !presetNames.includes(extPreset);
  });

  if (invalidExtends.length) {
    logError(
      `❌ ${filename} includes references to presets from this repo which don't exist locally:\n` +
        invalidExtends.map((e) => `    - ${e}`).join('\n'),
      filename,
    );
    return 'error';
  }

  return 'ok';
}

async function runTests() {
  const presets = readPresetsAndConfigs();

  // The repo config must be checked first (and migrated if necessary) because Renovate will
  // always include it in the other configs
  assert(
    presets[0].filename === repoRenovateConfigPath,
    'Repo config must be first in the list returned by readPresets',
  );

  const allPresetNames = presets.map((p) => p.name);
  if (presetArg && !allPresetNames.includes(presetArg)) {
    logError(`Invalid preset name "${presetArg}"`);
    process.exit(1);
  }

  const presetNames = allPresetNames.slice(1);

  const maybeFailedPresets = /** @type {string[]} */ ([]);
  const failedPresets = /** @type {string[]} */ ([]);

  for (let i = 0; i < presets.length; i++) {
    const preset = presets[i];
    if (presetArg && preset.name !== presetArg) {
      continue;
    }

    logGroup(`Validating ${preset.filename}`);

    const configResult = await checkFile(preset, failedPresets.includes(repoRenovateConfigPath));
    const extendsResult = checkExtends(preset, presetNames);

    if (configResult === 'error' || extendsResult === 'error') {
      failedPresets.push(preset.filename);
    } else if (configResult === 'unknown') {
      maybeFailedPresets.push(preset.filename);
    }

    if (i === 0 && (configResult !== 'ok' || extendsResult !== 'ok')) {
      console.error('The repo config is invalid, so skipping the other presets.');
      break;
    }

    logEndGroup();
  }

  if (maybeFailedPresets.length) {
    logOther(
      'warning',
      'Validating the following preset(s)/config(s) failed, but this may be due to errors in the repo config:\n' +
        maybeFailedPresets.map((p) => `    - ${p}`).join('\n'),
    );
  }

  if (failedPresets.length) {
    logError(
      '❌ Validating the following preset(s)/config(s) failed (see logs above for details):\n' +
        failedPresets.map((p) => `    - ${p}`).join('\n'),
    );
  }

  console.log();
  process.exit(failedPresets.length + maybeFailedPresets.length > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error(err.stack || err);
  process.exit(1);
});
