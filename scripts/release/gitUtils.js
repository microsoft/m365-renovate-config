// Heavily modified from https://github.com/changesets/action

import { exec } from '../utils/exec.js';

// export async function setupUser() {
//   await execa('git', ['config', 'user.name', `"github-actions[bot]"`]);
//   await execa('git', ['config', 'user.email', `"github-actions[bot]@users.noreply.github.com"`]);
// }

/** @type {import('execa').Options} */
const wrapperOptions = { stdio: 'inherit', reject: true };

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

export async function mergeMain() {
  await exec('git', ['merge', 'main', '--no-edit', '-Xtheirs'], wrapperOptions);
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

export async function checkIfClean() {
  const { stdout } = await exec('git', ['status', '--porcelain'], { reject: false });
  return !stdout.length;
}
