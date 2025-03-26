// Heavily modified from https://github.com/changesets/action

/**
 * Entry point called from `release.yml`. Must be CJS so the `actions/github-script`
 * `require()` wrapper can be used for proper path resolution.
 * @param {import('@octokit/rest', { with: { 'resolution-mode': 'require' } }).Octokit} github
 */
module.exports = async function release(github) {
  try {
    const { bumpAndRelease } = await import('./bumpAndRelease.js');
    const { logError } = await import('../utils/github.js');

    try {
      const githubToken = process.env.GITHUB_TOKEN;
      if (!githubToken) {
        throw new Error('Missing GITHUB_TOKEN environment variable');
      }
      await bumpAndRelease(github, githubToken);
    } catch (err) {
      logError(err);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('::error::Error importing release script deps: ' + err);
  }
};
