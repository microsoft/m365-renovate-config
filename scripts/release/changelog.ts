// Release notes line generator, referenced in .changesets/config.json
import changelogGithub from '@changesets/changelog-github';
import type { GetReleaseLine } from '@changesets/types';

const { getDependencyReleaseLine, getReleaseLine: githubGetReleaseLine } = changelogGithub;

export const getReleaseLine: GetReleaseLine = async (changeset, type, changelogOpts) => {
  const githubLine = await githubGetReleaseLine(changeset, type, changelogOpts);
  return githubLine.replace(/(Thanks \[.*?\]\(.*?\)!) (.*)/, '$2 ($1)');
};

// irrelevant since it's not a monorepo
export { getDependencyReleaseLine };
