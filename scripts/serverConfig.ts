// Renovate self-hosted (server) config for testPresetsFull.ts
// https://docs.renovatebot.com/self-hosted-configuration/

import { getToken } from './checkToken.ts';
import { getExtendsForLocalPreset } from './utils/extends.ts';
import { defaultBranch, defaultRepo, githubBranchName } from './utils/github.ts';
import { readPresets } from './utils/readPresets.ts';
import type { AllConfig } from './utils/types.ts';

const presets = readPresets();
// add a reference to the branch if not testing main
const branchRef = githubBranchName === defaultBranch ? '' : githubBranchName;

const config: AllConfig = {
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
