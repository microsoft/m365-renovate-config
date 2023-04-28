// Heavily modified from https://github.com/changesets/action
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import * as gitUtils from './gitUtils.js';
import { defaultRepoDetails, logError } from '../utils/github.js';
import { root } from '../utils/paths.js';
import { runBin } from '../utils/runBin.js';
import { getHeadingText, splitByHeading } from '../utils/markdown.js';
import { updateRefs } from './updateRefs.js';

/**
 * @typedef {{ name: string; version: string }} Package
 * @returns {Package}
 */
export function getPackage() {
  return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
}

/**
 * @param {string} changelog
 * @param {string} version
 */
export function getChangelogEntry(changelog, version) {
  const sections = splitByHeading(changelog, 2);
  for (const section of sections) {
    if (getHeadingText(section, 2) === version) {
      return section;
    }
  }
}

/**
 * @param {Octokit} octokit
 * @param {string} tagName
 */
async function createRelease(octokit, tagName) {
  const pkg = getPackage();

  const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');

  const changelogEntry = getChangelogEntry(changelog, pkg.version);
  if (!changelogEntry) {
    // we can find a changelog but not the entry for this version
    // if this is true, something has probably gone wrong
    throw new Error(`Could not find changelog entry for ${pkg.name}@${pkg.version}`);
  }

  await octokit.rest.repos.createRelease({
    name: tagName,
    tag_name: tagName,
    body: changelogEntry,
    prerelease: pkg.version.includes('-'),
    ...defaultRepoDetails,
  });
}

/**
 * @param {string} githubToken
 * @param {string} branch
 * @returns {Promise<boolean>}
 */
export async function bumpAndRelease(githubToken, branch) {
  const octokit = new Octokit({
    auth: githubToken,
    ...defaultRepoDetails,
  });

  // Switch to the release branch and merge with main
  await gitUtils.switchToMaybeExistingBranch(branch);
  await gitUtils.mergeMain();

  // Update any "extends" refs to point to the release branch
  await updateRefs(branch);

  // Update the version and changelog
  const changesetPublishOutput = await runBin('changeset', ['version'], {
    cwd: root,
    stdio: 'inherit',
    reject: true,
  });

  let published = false;

  // TODO does this work?
  for (let line of changesetPublishOutput.stdout.split('\n')) {
    // TODO
  }

  // Commit, tag, and push
  const pkg = getPackage();
  const tagName = `v${pkg.version}`;
  await gitUtils.commitAll(`Bump version to ${tagName}`);
  await gitUtils.tag(tagName);
  await gitUtils.push(branch);
  await gitUtils.pushTags();

  await createRelease(octokit, tagName);

  return published;
}

// /**
//  * TODO: extract what's needed from here
//  */
// export async function runVersion() {
//   const commitMessage = 'Bump version';
//   const branch = github.context.ref.replace('refs/heads/', '');
//   const versionBranch = `changeset-release/${branch}`;

//   await gitUtils.switchToMaybeExistingBranch(versionBranch);
//   await gitUtils.reset(github.context.sha);

//   await runBin('changeset', ['version'], { cwd: root });

//   // project with `commit: true` setting could have already committed files
//   if (!(await gitUtils.checkIfClean())) {
//     await gitUtils.commitAll(commitMessage);
//   }

//   await gitUtils.push(versionBranch, { force: true });
// }
