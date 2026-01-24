// Renovate self-hosted (server) config for testPresetsFull.js
// https://docs.renovatebot.com/self-hosted-configuration/

/** @import { AllConfig } from './utils/types.js' */
import { getToken } from './checkToken.js';
import { getExtendsForLocalPreset } from './utils/extends.js';
import { defaultBranch, defaultRepo, githubBranchName } from './utils/github.js';
import { readPresets } from './utils/readPresets.js';

const presets = readPresets();
// add a reference to the branch if not testing main
const branchRef = githubBranchName === defaultBranch ? '' : githubBranchName;

/** @type {AllConfig} */
const config = {
  // All we really need here is the config validation, so do the shortest type of dry run
  // https://docs.renovatebot.com/self-hosted-configuration/#dryrun
  dryRun: 'extract',
  repositories: [defaultRepo],
  hostRules: [{ abortOnError: true }],
  // For the basic config test to pass, the token must be a string
  token: getToken() || '',
  force: {
    printConfig: true,
    // Force an "extends" config with all the presets from this repo.
    // (Note this will NOT fix the names of extended presets within another preset,
    // so extended presets will be fetched from main, not the branch. This is usually
    // fine but will cause an error if a preset extends a newly-added preset in a PR.)
    extends: presets.map((p) => getExtendsForLocalPreset(p.name, branchRef)),
    // also use the current branch as the base
    ...(githubBranchName &&
      githubBranchName !== defaultBranch && {
        baseBranchPatterns: [githubBranchName],
        useBaseBranchConfig: 'merge',
      }),
  },
};

export default config;
