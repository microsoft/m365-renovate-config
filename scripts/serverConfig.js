// Renovate self-hosted (server) config for testPresetsFull.js
// https://docs.renovatebot.com/self-hosted-configuration/

/** @import { RenovateConfig } from './utils/types.js' */
import { tokenEnv } from './checkToken.js';
import { getExtendsForLocalPreset } from './utils/extends.js';
import { defaultBranch, defaultRepo, githubBranchName } from './utils/github.js';
import { readPresets } from './utils/readPresets.js';

const presets = readPresets();
// add a reference to the branch if not testing main
const branchRef = githubBranchName === defaultBranch ? '' : githubBranchName;

/** @type {RenovateConfig} */
const config = {
  // All we really need here is the config validation, so do the shortest type of dry run
  // https://docs.renovatebot.com/self-hosted-configuration/#dryrun
  dryRun: 'extract',
  repositories: [defaultRepo],
  hostRules: [{ abortOnError: true }],
  token: tokenEnv,
  force: {
    printConfig: true,
    // force an "extends" config with all the presets from this repo
    extends: [...presets, { name: 'oops' }].map((p) => getExtendsForLocalPreset(p.name, branchRef)),
    // also use the current branch as the base
    ...(githubBranchName &&
      githubBranchName !== defaultBranch && {
        baseBranchPatterns: [githubBranchName],
        useBaseBranchConfig: 'merge',
      }),
  },
};

export default config;
