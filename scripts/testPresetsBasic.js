import assert from 'assert';
import fs from 'fs';
import jju from 'jju';
import path from 'path';
import { Transform } from 'stream';
import { getLocalPresetFromExtends } from './utils/extends.js';
import { formatFile } from './utils/formatFile.js';
import {
  isGithub,
  logEndGroup,
  logError,
  logOther,
  logGroup,
  repoRenovateConfigPath,
} from './utils/github.js';
import { readPresets } from './utils/readPresets.js';
import { formatRenovateLog } from './utils/renovateLogs.js';
import { runBin } from './utils/runBin.js';

/**
 * @typedef {import('./utils/types.js').LocalPresetData} LocalPresetData
 * @typedef {import('./utils/types.js').RenovateLog} RenovateLog
 * @typedef {import('./utils/types.js').RenovatePreset} RenovatePreset
 *
 * @typedef {'error'|'unknown'|'ok'} Result
 */
/** */

/**
 * @param {LocalPresetData} preset
 * @param {boolean} hasInvalidRepoConfig
 * @returns {Promise<Result>}
 */
async function checkPreset(preset, hasInvalidRepoConfig) {
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
      } catch (err) {
        callback(null, chunk.toString());
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
        // If the repo config has errors, those will be echoed for the presets.
        // In that case msg (currently) looks like ".github/renovate.json5 contains errors"
        if (logJson.msg.includes(filename)) {
          // The errors are from this preset/config, so save them to log later
          // (for the repo config it logs the same errors twice, so use a set)
          for (const error of logJson.errors) {
            errorMessages.add(error.message);
          }
        }
        callback(null, '');
      } else {
        // Unknown log
        callback(null, formatRenovateLog(logJson, true) + '\n');
      }
    },
  });

  // Redirect formatted logs to stdout, and wait for the process
  configProcess.all.pipe(logTransform).pipe(process.stdout);
  const processFailed = (await configProcess).failed;

  if (errorMessages.size > 0) {
    logError(
      `❌ Found errors in ${filename}:\n` +
        [...errorMessages].map((msg) => `    - ${msg}`).join('\n'),
      filename
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
        filename
      );
      return 'unknown';
    }

    logError(`Unknown error validating ${filename}. See logs for details.`, filename);
    return 'error';
  }

  if (migratedConfig || newConfig) {
    return migrateConfig(preset, migratedConfig || newConfig);
  }

  return 'ok';
}

/**
 * Write migrated config content to a file and format it if appropriate.
 * @param {LocalPresetData} preset
 * @param {*} migratedConfig
 * @returns {Result}
 */
function migrateConfig(preset, migratedConfig) {
  const { filename, absolutePath, content } = preset;
  const migratedContent = jju.update(content, migratedConfig, {
    indent: 2,
    mode: path.extname(filename) === '.json5' ? 'cjson' : 'json',
  });

  // Update the file if running locally or this is the repo config (to prevent others from failing).
  // There's no point in updating other configs in CI since they can't be committed.
  const isRepoConfig = filename === repoRenovateConfigPath;
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
      filename
    );
    console.log(migratedContent);
  }

  if (!isGithub || isRepoConfig) {
    // Actually update and format the file
    console.log(`Migrating ${filename} (see git diff for details)`);
    fs.writeFileSync(absolutePath, migratedContent);
    try {
      formatFile(absolutePath);
    } catch (err) {
      console.error(err);
      result = 'error';
    }
  }

  return result;
}

/**
 * Check the validity of any preset `extends` values that point to local presets.
 * (This is useful when renaming things.)
 * DOES NOT check the validity of built-in or other remote presets.
 * @param {LocalPresetData} preset
 * @param {string[]} presetNames
 * @returns {Exclude<Result,'warn'>}
 */
function checkExtends(preset, presetNames) {
  const { json, filename } = preset;
  if (!json.extends) {
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
      filename
    );
    return 'error';
  }

  return 'ok';
}

async function runTests() {
  const presets = readPresets({ includeRepoConfig: true });

  // The repo config must be checked first (and migrated if necessary) because Renovate will
  // always include it in the other configs
  assert(
    presets[0].filename === repoRenovateConfigPath,
    'Repo config must be first in the list returned by readPresets'
  );

  const presetNames = presets.slice(1).map((p) => p.name);

  const maybeFailedPresets = /** @type {string[]} */ ([]);
  const failedPresets = /** @type {string[]} */ ([]);

  for (const preset of presets) {
    logGroup(`Validating ${preset.filename}`);

    const configResult = await checkPreset(preset, failedPresets.includes(repoRenovateConfigPath));
    const extendsResult = checkExtends(preset, presetNames);

    if (configResult === 'error' || extendsResult === 'error') {
      failedPresets.push(preset.filename);
    } else if (configResult === 'unknown') {
      maybeFailedPresets.push(preset.filename);
    }

    logEndGroup();
  }

  if (maybeFailedPresets.length) {
    logOther(
      'warning',
      'Validating the following preset(s) failed, but this may be due to errors in the repo config:\n' +
        maybeFailedPresets.map((p) => `    - ${p}`).join('\n')
    );
  }

  if (failedPresets.length) {
    logError(
      '❌ Validating the following preset(s) failed (see logs above for details):\n' +
        failedPresets.map((p) => `    - ${p}`).join('\n')
    );
  }

  console.log();
  process.exit(failedPresets.length + maybeFailedPresets.length > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error(err.stack || err);
  process.exit(1);
});
