// Heavily modified from https://github.com/changesets/action
import { bumpAndRelease } from './bumpAndRelease.js';
import * as gitUtils from './gitUtils.js';
import { logError } from '../utils/github.js';

(async () => {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new Error('Missing GITHUB_TOKEN environment variable');
  }

  const branch = process.env.MAJOR_BRANCH;
  if (!branch) {
    throw new Error('Missing MAJOR_BRANCH environment variable');
  }

  await gitUtils.setCredentials(githubToken);

  await bumpAndRelease(githubToken, branch);
})().catch((err) => {
  logError(err);
  gitUtils.cleanUpCredentials();
  process.exit(1);
});
