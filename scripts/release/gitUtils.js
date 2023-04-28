// Heavily modified from https://github.com/changesets/action
import fs from 'fs';
import { exec } from '../utils/exec.js';
import { defaultBranch } from '../utils/github.js';

const netrc = `${process.env.HOME}/.netrc`;
const user = 'github-actions[bot]';

/** @param {string[]} args */
function git(args) {
  return exec('git', args, { stdio: 'inherit', reject: true });
}

/**
 * Set username and email (as github-actions[bot]) and GitHub credentials (in .netrc).
 * Also set event handlers to try to clean up the credentials on exit.
 * @param {string} githubToken
 */
export async function setCredentials(githubToken) {
  await git(['config', 'user.name', user]);
  await git(['config', 'user.email', `${user}@users.noreply.github.com"`]);

  console.log('setting GitHub credentials in .netrc');
  fs.writeFileSync(netrc, `machine github.com\nlogin ${user}\npassword ${githubToken}`);

  process.on('exit', cleanUpCredentials);
  process.on('SIGINT', cleanUpCredentials);
  process.on('SIGTERM', cleanUpCredentials);
}

export function cleanUpCredentials() {
  fs.rmSync(netrc, { force: true });
}

/** @param {string} branch */
export async function push(branch) {
  await git(['push', 'origin', `HEAD:${branch}`]);
}

export async function pushTags() {
  await git(['push', 'origin', '--tags']);
}

/**
 * Switch to the branch, creating it if it doesn't exist
 * @param {string} branch
 */
export async function switchToMaybeExistingBranch(branch) {
  // for this one, don't throw on error (it's expected if the branch doesn't exist)
  const result = await exec('git', ['checkout', branch], { reject: false });
  if (result.failed) {
    await git(['checkout', '-b', branch]);
  } else {
    console.log('Switched to existing branch', branch);
  }
}

/** Merge with main (accepting main version for any conflicts) */
export async function mergeMain() {
  await git(['merge', defaultBranch, '--no-edit', '-Xtheirs']);
}

/** @param {string} tagName */
export async function tag(tagName) {
  await git(['tag', tagName]);
}

/**
 * @param {string} pathSpec
 * @param {'hard' | 'soft' | 'mixed'} [mode]
 */
export async function reset(pathSpec, mode = 'hard') {
  await git(['reset', `--${mode}`, pathSpec]);
}

/** @param {string} message */
export async function commitAll(message) {
  await git(['add', '.']);
  await git(['commit', '-m', message]);
}
