import fs from 'fs';
import path from 'path';
import { getEnv } from './utils/getEnv.js';
import {
  defaultBranch,
  defaultRepo,
  isGithub,
  logEndGroup,
  logError,
  logGroup,
  primaryBranches,
} from './utils/github.js';
import { root } from './utils/paths.js';
import { readPresets } from './utils/readPresets.js';
import { logRenovateErrorDetails, readRenovateLogs } from './utils/renovateLogs.js';
import { runBin } from './utils/runBin.js';

async function runTests() {
  const ref = getEnv('GITHUB_REF', isGithub);
  const branchName = ref.replace('refs/heads', '');
  const repository = getEnv('GITHUB_REPOSITORY', isGithub);
  const eventName = getEnv('GITHUB_EVENT_NAME', isGithub);
  const token = getEnv('TOKEN', isGithub);

  if (
    !isGithub ||
    !primaryBranches.includes(branchName) ||
    eventName !== 'push' ||
    repository !== defaultRepo
  ) {
    // This would be possible but complex to test when running against a github branch, and likely
    // not possible to completely test locally. Steps for testing against a github branch:
    // - Modify the config files to point to a temporary generated tag name
    // - Commit the modified files and create the tag
    // - Push the tag (don't push the commit to the branch)
    //   - Not sure if this would work for fork PRs, and we don't want a fork's unvalidated
    //     changes pushed to a tag in the main repo
    // - Run the test
    // - Delete the tag
    console.log('Skipping full Renovate test run (only meaningful after configs are checked in)');
    process.exit(0);
  }

  const presets = readPresets();
  // add a reference to the branch if not testing main
  const branchRef = branchName === defaultBranch ? '' : `#${branchName}`;

  const logFile = path.join(root, 'renovate.log');
  fs.writeFileSync(logFile, ''); // Renovate wants this to exist already

  // https://docs.renovatebot.com/self-hosted-configuration/
  const selfHostedConfig = {
    // All we really need here is the config validation, so do the shortest type of dry run
    // https://docs.renovatebot.com/self-hosted-configuration/#dryrun
    dryRun: 'extract',
    repositories: [defaultRepo],
    hostRules: [{ abortOnError: true }],
    logFile,
    logFileLevel: 'debug',
    token,
    force: {
      printConfig: true,
      // force an "extends" config with all the presets from this repo
      extends: Object.keys(presets).map(
        (p) => `${defaultRepo}:${path.basename(p, '.json')}${branchRef}`
      ),
      // also use the current branch as the base
      ...(branchName !== defaultBranch && {
        baseBranches: [branchName],
        useBaseBranchConfig: 'merge',
      }),
    },
  };
  // Normally the Renovate server config would be JS, but Renovate seems to have trouble importing
  // the JS config due to this package having type: module (and fails with a misleading error).
  // So write the config to JSON instead.
  // Also, use .json5 to ensure it's not interpreted as a preset by any other steps.
  const configFile = path.join(root, 'renovate-config.json5');
  const configContent = JSON.stringify(selfHostedConfig, null, 2);
  fs.writeFileSync(configFile, configContent);

  logGroup('Renovate server config:');
  console.log(configContent);
  logEndGroup();

  logGroup('Running Renovate');
  const result = await runBin('renovate', [], {
    stdio: 'inherit',
    env: { LOG_LEVEL: 'info', RENOVATE_CONFIG_FILE: configFile },
  });
  logEndGroup();

  if (result.failed) {
    logRenovateError(logFile);
    process.exit(1);
  } else {
    // clean up temporary server config
    fs.unlinkSync(configFile);
  }
}

/** @param {string} logFile */
function logRenovateError(logFile) {
  /**
   * @typedef {import('./utils/renovateLogTypes.js').RenovateLog} RenovateLog
   * @typedef {RenovateLog & { preset: string }} RenovatePresetDebugLog
   */
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
