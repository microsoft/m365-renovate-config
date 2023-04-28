// Release notes line generator, referenced in .changesets/config.json
const {
  default: { getDependencyReleaseLine, getReleaseLine: githubGetReleaseLine },
} = require('@changesets/changelog-github');

/**
 * @type {import('@changesets/types').GetReleaseLine}
 */
async function getReleaseLine(changeset, type, changelogOpts) {
  const githubLine = await githubGetReleaseLine(changeset, type, changelogOpts);
  return githubLine.replace(/(Thanks \[.*?\]\(.*?\)!) (.*)/, '$2 ($1)');
}

module.exports = {
  getReleaseLine,
  // irrelevant since it's not a monorepo
  getDependencyReleaseLine,
};
