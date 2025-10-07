/** @import { RenovatePresetDebugLog } from './utils/types.js' */

import fs from 'fs';
import path from 'path';
import { getEnv } from './utils/getEnv.js';
import {
  defaultRepo,
  isGithub,
  logEndGroup,
  logError,
  logGroup,
  logOther,
} from './utils/github.js';
import { root } from './utils/paths.js';
import { logRenovateErrorDetails, readRenovateLogs } from './utils/renovateLogs.js';
import { runBin } from './utils/runBin.js';
import serverConfig from './serverConfig.js';
import { checkToken } from './checkToken.js';

const configFilePath = path.join(import.meta.dirname, 'serverConfig.js');

async function runTests() {
  const repository = getEnv('GITHUB_REPOSITORY', isGithub);

  if (!isGithub || repository !== defaultRepo) {
    // This is possible to test against a github branch in the main repo, but won't work with fork PRs
    // or locally. In that case, exit with a warning.
    logOther(
      'warning',
      'Skipping full Renovate test run (only works after configs are checked in ' +
        'or for branches in the main repo)',
    );
    process.exit(0);
  }

  checkToken();

  const logFile = path.join(root, 'renovate.log');
  fs.writeFileSync(logFile, ''); // Renovate wants this to exist already

  logGroup('Renovate server config:');
  console.log(JSON.stringify(serverConfig, null, 2));
  logEndGroup();

  logGroup('Running Renovate');
  const result = await runBin('renovate', [], {
    stdio: 'inherit',
    env: {
      LOG_LEVEL: 'info',
      LOG_FILE: logFile,
      LOG_FILE_LEVEL: 'debug',
      RENOVATE_CONFIG_FILE: configFilePath,
    },
  });
  logEndGroup();

  if (result.failed) {
    logRenovateError(logFile);
    process.exit(1);
  }
}

/** @param {string} logFile */
function logRenovateError(logFile) {
  const logs = readRenovateLogs(logFile);

  const invalidPresetLog = logs.find((l) => !!l.err && l.msg === 'config-presets-invalid');
  if (invalidPresetLog) {
    // As of writing, there's only a debug log which directly includes the name of the preset that
    // failed to validate (it's not included in any of the higher-severity logs)
    const presetDebugLog = /** @type {RenovatePresetDebugLog | undefined} */ (
      logs.find((l) => !!l.err && /** @type {RenovatePresetDebugLog} */ (l).preset)
    );

    if (presetDebugLog) {
      logError(`Preset "${presetDebugLog.preset}" is invalid`);
      logRenovateErrorDetails(presetDebugLog);
    } else {
      logError('A preset failed to validate');
      logRenovateErrorDetails(invalidPresetLog);
    }
  } else {
    logError('Running Renovate failed for an unknown reason');
  }
}

runTests().catch((err) => {
  console.error(err.stack || err);
  process.exit(1);
});
