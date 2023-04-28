// Heavily modified from https://github.com/changesets/action
import fs from 'fs';
import changesetsReadModule from '@changesets/read';
import { bumpAndRelease } from './bumpAndRelease.js';
import { logError } from '../utils/github.js';

// funky export format due to esModuleInterop probably
const { default: readChangesets } = changesetsReadModule;

(async () => {
  const cwd = process.cwd();

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new Error('Missing GITHUB_TOKEN environment variable');
  }

  const branch = process.env.RELEASE_BRANCH;
  if (!branch) {
    throw new Error('Missing RELEASE_BRANCH environment variable');
  }

  // TODO different method or add cleanup
  console.log('setting GitHub credentials');
  fs.writeFileSync(
    `${process.env.HOME}/.netrc`,
    `machine github.com\nlogin github-actions[bot]\npassword ${githubToken}`
  );

  const changesets = await readChangesets(cwd);
  const hasNonEmptyChangesets = changesets.some((changeset) => changeset.releases.length > 0);

  if (!changesets.length) {
    console.log('No changesets found');
  } else if (!hasNonEmptyChangesets) {
    console.log('All changesets are empty; skipping release');
  } else {
    await bumpAndRelease(githubToken, branch);
  }
})().catch((err) => {
  logError(err);
  process.exit(1);
});
