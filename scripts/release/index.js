// Heavily modified from https://github.com/changesets/action
import { bumpAndRelease } from './bumpAndRelease.js';
import * as gitUtils from './gitUtils.js';
import { logError } from '../utils/github.js';
import { checkToken } from '../checkToken.js';

/**
 * Entry point called from release.yml
 * @param {import('@octokit/rest').Octokit} github
 */
export async function release(github) {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error('Missing GITHUB_TOKEN environment variable');
    }
    await checkToken(githubToken);
    await gitUtils.setCredentials(githubToken);

    await bumpAndRelease(github);
  } catch (err) {
    logError(err);
    process.exitCode = 1;
  } finally {
    gitUtils.cleanUpCredentials();
  }
}
