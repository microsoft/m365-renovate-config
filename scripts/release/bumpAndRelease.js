import changesetsReadModule from '@changesets/read';
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import * as gitUtils from './gitUtils.js';
import {
  defaultBranch,
  defaultRepo,
  defaultRepoDetails,
  logEndGroup,
  logGroup,
} from '../utils/github.js';
import { root } from '../utils/paths.js';
import { runBin } from '../utils/runBin.js';
import { getHeadingText, splitByHeading } from '../utils/markdown.js';
import { updateRefs } from './updateRefs.js';
import { formatFile } from '../utils/formatFile.js';

const { default: readChangesets } = changesetsReadModule;

const changelogFile = path.join(root, 'CHANGELOG.md');
const headingLevel = 2;

/**
 * @returns {{ name: string; version: string }}
 */
export function readPackageJson() {
  return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
}

/**
 * Get the changelog entry and add a release date and compare link.
 * Returns the new entry's text (not the full changelog).
 * (This would ideally be done via some changesets API during the `version` command,
 * but that's not supported as of writing.)
 * @param {string} prevVersion
 * @param {string} newVersion
 */
export async function amendChangelog(prevVersion, newVersion) {
  console.log('\nUpdating changelog with date and compare link');

  const changelog = fs.readFileSync(changelogFile, 'utf8');

  let changelogEntry = '';
  const sections = splitByHeading(changelog, headingLevel);
  for (const section of sections) {
    if (getHeadingText(section, headingLevel) === newVersion) {
      changelogEntry = section;
    }
  }

  if (!changelogEntry) {
    throw new Error(`Couldn't find changelog entry for version ${newVersion}`);
  }

  const heading = getHeadingText(changelogEntry, headingLevel);

  // April 27, 2023 at 7:58 PM
  const releaseDate = new Date().toLocaleString('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour12: true,
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'US/Pacific',
    timeZoneName: 'shortOffset',
  });
  const compareLink = `[Compare source](https://github.com/${defaultRepo}/compare/v${prevVersion}...v${newVersion})`;

  const amendedEntry = changelogEntry.replace(
    heading,
    `${heading}\n\n${compareLink} - ${releaseDate}`
  );

  fs.writeFileSync(changelogFile, changelog.replace(changelogEntry, amendedEntry));
  await formatFile(changelogFile, { quiet: true });

  return amendedEntry;
}

/**
 * @param {string} githubToken
 * @param {string} majorBranch
 */
export async function bumpAndRelease(githubToken, majorBranch) {
  const octokit = new Octokit({
    auth: githubToken,
    ...defaultRepoDetails,
  });
  const changesets = await readChangesets(root);
  if (!changesets.length) {
    console.log('No changesets found');
    return;
  }
  if (!changesets.some((changeset) => changeset.releases.length)) {
    console.log('All changesets are empty; skipping release');
    return;
  }

  // Local bump and changelog update
  const prevVersion = readPackageJson().version;

  // Update the version and changelog
  logGroup('Bumping versions and updating changelog locally');

  await runBin('changeset', ['version'], { cwd: root, stdio: 'inherit', reject: true });

  const newVersion = readPackageJson().version;
  if (prevVersion === newVersion) {
    throw new Error('Version was not updated, despite non-empty changesets existing');
  }
  const tagName = `v${newVersion}`;

  // Add a date and tag link to the changelog file (technically the tag doesn't exist yet
  // and creating it could fail, but that's not a big deal)
  const changelogEntry = await amendChangelog(prevVersion, newVersion);

  logEndGroup();

  // Commit and push on the main branch (remove changesets; update changelog and version)
  logGroup('Committing and updating main');
  await gitUtils.commitAll(`Bump version to ${newVersion}`);
  await gitUtils.push(defaultBranch);
  logEndGroup();

  // Switch to the release branch and merge with main
  logGroup('Merging main into release branch ' + majorBranch);
  await gitUtils.switchToMaybeExistingBranch(majorBranch);
  await gitUtils.mergeMain();
  logEndGroup();

  // Create a commit and tag with "extends" refs pointing to the release *tag*
  logGroup('Creating commit and tag for ' + tagName);
  await updateRefs(tagName);
  await gitUtils.commitAll(`Update tag refs for ${tagName}`);
  await gitUtils.tag(tagName);
  await gitUtils.push(majorBranch);
  await gitUtils.pushTags();
  logEndGroup();

  // Now create another commit with "extends" refs pointing to the major branch
  logGroup('Updating branch refs and committing for ' + majorBranch);
  await updateRefs(majorBranch);
  await gitUtils.commitAll(`Update branch refs for ${majorBranch}`);
  await gitUtils.push(majorBranch);
  logEndGroup();

  // Create GitHub release pointing to the tag (with full tag refs and using the
  // non-amended changelog entry text)
  logGroup('Creating GitHub release for ' + tagName);
  await octokit.rest.repos.createRelease({
    name: tagName,
    tag_name: tagName,
    // Remove the header (the release page shows a redundant header)
    body: changelogEntry.replace(getHeadingText(changelogEntry, headingLevel), ''),
    prerelease: tagName.includes('-'),
    ...defaultRepoDetails,
  });
  logEndGroup();
}
