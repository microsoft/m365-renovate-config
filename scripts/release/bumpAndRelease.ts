import readChangesets from '@changesets/read';
import type { Octokit } from '@octokit/rest';
import fs from 'fs';
import { checkToken } from '../checkToken.ts';
import { formatFileContents } from '../utils/formatFile.ts';
import { getReleaseBranchFromVersion } from '../utils/getReleaseBranches.ts';
import * as git from '../utils/git.ts';
import {
  defaultBranch,
  defaultRepo,
  defaultRepoDetails,
  logEndGroup,
  logGroup,
} from '../utils/github.ts';
import { getHeadingText, splitByHeading } from '../utils/markdown.ts';
import { paths } from '../utils/paths.ts';
import { readPackageJson } from '../utils/readPackageJson.ts';
import { runBin } from '../utils/runBin.ts';
import { updateRefs } from './updateRefs.ts';

const headingLevel = 2;
const skipCi = '[skip ci]';

/**
 * Get the changelog entry and add a release date and compare link.
 * Returns the new entry's text (not the full changelog).
 * (This would ideally be done via some changesets API during the `version` command,
 * but that's not supported as of writing.)
 */
export async function amendChangelog(prevVersion: string, newVersion: string) {
  const changelog = fs.readFileSync(paths.changelog, 'utf8');

  let changelogEntry = '';
  const sections = splitByHeading(changelog, headingLevel);
  for (const section of sections) {
    if (getHeadingText(section, headingLevel) === newVersion) {
      changelogEntry = section;
      break;
    }
  }

  if (!changelogEntry) {
    throw new Error(`Couldn't find changelog entry for version ${newVersion}`);
  }

  const heading = getHeadingText(changelogEntry, headingLevel);

  // April 27, 2023 at 7:58 PM
  const releaseDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour12: true,
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short',
  });
  const compareLink = `[Compare source](https://github.com/${defaultRepo}/compare/v${prevVersion}...v${newVersion})`;

  const amendedEntry = changelogEntry.replace(
    heading,
    `${heading}\n\n${compareLink} - ${releaseDate}`,
  );

  const formattedContent = await formatFileContents(
    paths.changelog,
    changelog.replace(changelogEntry, amendedEntry),
  );
  fs.writeFileSync(paths.changelog, formattedContent);

  return amendedEntry;
}

/**
 * Update changelog and version, commit/push to main and `releaseBranch`, and create a release.
 * Throws an error if anything fails.
 */
export async function bumpAndRelease(github: Octokit, githubToken: string) {
  await checkToken(githubToken);
  await git.setCredentials(githubToken);

  const changesets = await readChangesets(paths.root);
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
  await runBin('changeset', ['version'], { cwd: paths.root, stdio: 'inherit', reject: true });
  logEndGroup();

  // Get the new version to determine the tag name and release branch
  const newVersion = readPackageJson().version;
  if (prevVersion === newVersion) {
    throw new Error('Version was not updated, despite non-empty changesets existing');
  }
  const tagName = `v${newVersion}`;
  // This MUST be calculcated after the version is updated, in case it's a major bump
  const releaseBranch = getReleaseBranchFromVersion(newVersion);

  // Add a date and tag link to the changelog file (technically the tag doesn't exist yet
  // and creating it could fail, but that's not a big deal)
  logGroup('Amending generated changelog entry');
  const changelogEntry = await amendChangelog(prevVersion, newVersion);
  logEndGroup();

  // Commit and push on the main branch (remove changesets; update changelog and version).
  // A CI run on this commit is unnecessary.
  logGroup('Committing and updating main');
  await git.commitAll(`Bump version to ${newVersion} ${skipCi}`);
  await git.push(defaultBranch);
  logEndGroup();

  // Switch to the release branch and merge with main
  logGroup('Merging main into release branch ' + releaseBranch);
  await git.switchToMaybeExistingBranch(releaseBranch);
  await git.mergeMain(`Merge ${defaultBranch} into ${releaseBranch} ${skipCi}`);
  logEndGroup();

  // Create a commit and tag with "extends" refs pointing to the release *tag*
  logGroup('Creating commit and tag for ' + tagName);
  await updateRefs(tagName);
  await git.commitAll(`Update tag refs for ${tagName} ${skipCi}`);
  await git.tag(tagName);
  logEndGroup();

  // Now create another commit with "extends" refs pointing to the major version release branch
  logGroup('Updating branch refs and committing for ' + releaseBranch);
  await updateRefs(releaseBranch);
  // Allow CI to run on this final commit in the release branch
  await git.commitAll(`Update branch refs for ${releaseBranch} (version ${newVersion})`);
  logEndGroup();

  logGroup('Pushing release branch updates and tag');
  await git.push(releaseBranch);
  await git.pushTags();
  logEndGroup();

  // Create GitHub release pointing to the tag (with full tag refs and using the
  // non-amended changelog entry text)
  logGroup('Creating GitHub release for ' + tagName);
  await github.rest.repos.createRelease({
    name: tagName,
    tag_name: tagName,
    // Remove the header (the release page shows a redundant header)
    body: changelogEntry.replace(/^#+.*?\n+/, ''),
    prerelease: tagName.includes('-'),
    ...defaultRepoDetails,
  });
  logEndGroup();
}
