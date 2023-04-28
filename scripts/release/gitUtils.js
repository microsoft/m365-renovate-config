// Heavily modified from https://github.com/changesets/action
import fs from 'fs';
import { exec } from '../utils/exec.js';
import { defaultBranch } from '../utils/github.js';

/** @type {import('execa').Options} */
const wrapperOptions = { stdio: 'inherit', reject: true };

const netrc = `${process.env.HOME}/.netrc`;
const user = 'github-actions[bot]';

/**
 * @param {string} githubToken
 */
export async function setCredentials(githubToken) {
  await exec('git', ['config', 'user.name', `"${user}"`], wrapperOptions);
  await exec('git', ['config', 'user.email', `"${user}@users.noreply.github.com"`], wrapperOptions);

  console.log('setting GitHub credentials in .netrc');
  fs.writeFileSync(netrc, `machine github.com\nlogin ${user}\npassword ${githubToken}`);
}

export function cleanUpCredentials() {
  fs.rmSync(netrc, { force: true });
}

/**
 * @param {string} branch
 */
export async function push(branch) {
  await exec('git', ['push', 'origin', `HEAD:${branch}`], wrapperOptions);
}

export async function pushTags() {
  await exec('git', ['push', 'origin', '--tags'], wrapperOptions);
}

/**
 * @param {string} branch
 */
export async function switchToMaybeExistingBranch(branch) {
  const result = await exec('git', ['checkout', branch], { reject: false });
  if (result.failed) {
    await exec('git', ['checkout', '-b', branch], wrapperOptions);
  } else {
    console.log('Switched to existing branch', branch);
  }
}

/** Merge with main (accepting main version for any conflicts) */
export async function mergeMain() {
  await exec('git', ['merge', defaultBranch, '--no-edit', '-Xtheirs'], wrapperOptions);
}

/**
 * @param {string} tagName
 */
export async function tag(tagName) {
  await exec('git', ['tag', tagName], wrapperOptions);
}

/**
 * @param {string} pathSpec
 * @param {'hard' | 'soft' | 'mixed'} [mode]
 */
export async function reset(pathSpec, mode = 'hard') {
  await exec('git', ['reset', `--${mode}`, pathSpec], wrapperOptions);
}

/**
 * @param {string} message
 */
export async function commitAll(message) {
  await exec('git', ['add', '.'], wrapperOptions);
  await exec('git', ['commit', '-m', message], wrapperOptions);
}
