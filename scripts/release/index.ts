// Heavily modified from https://github.com/changesets/action
import type { Octokit } from '@octokit/rest';

export async function release(github: Octokit) {
  try {
    const { bumpAndRelease } = await import('./bumpAndRelease.ts');
    const { logError } = await import('../utils/github.ts');

    try {
      const githubToken = process.env.GITHUB_TOKEN;
      if (!githubToken) {
        throw new Error('Missing GITHUB_TOKEN environment variable');
      }
      await bumpAndRelease(github, githubToken);
    } catch (err) {
      logError(err as Error);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('::error::Error importing release script deps: ' + (err as Error).message);
  }
}
