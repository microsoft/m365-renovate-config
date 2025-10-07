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

  // If a preset fails to validate while running renovate, there's a special message config-presets-invalid.
  // (Unclear if there can be multiple of these logs, but check anyway.)
  const invalidPresetLogs = logs.filter((l) => !!l.err && l.msg === 'config-presets-invalid');
  if (invalidPresetLogs.length) {
    // As of writing, there's only a debug log which directly includes the name of the preset that
    // failed to validate (it's not included in any of the higher-severity logs).
    const presetDebugLogs = /** @type {RenovatePresetDebugLog[]} */ (
      logs.filter((l) => !!l.err && /** @type {RenovatePresetDebugLog} */ (l).preset)
    );

    if (presetDebugLogs.length) {
      for (const log of presetDebugLogs) {
        logError(`Preset "${log.preset}" is invalid`);
        logRenovateErrorDetails(log);
      }
    } else {
      logError('One or more presets failed to validate');
      for (const log of invalidPresetLogs) {
        logRenovateErrorDetails(log);
      }
    }
  } else {
    const errorRollupLog = logs.find((l) => l.loggerErrors);
    if (errorRollupLog?.loggerErrors?.length) {
      logError('Error while running Renovate');
      for (const log of errorRollupLog.loggerErrors) {
        logRenovateErrorDetails(log);
      }
    } else {
      logError('Running Renovate failed for an unknown reason (see logs)');
    }
  }

  logError('For debug logs, see the renovate-dry-run-log artifact.');
}

runTests().catch((err) => {
  console.error(err.stack || err);
  process.exit(1);
});
