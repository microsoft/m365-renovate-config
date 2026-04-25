// Heavily modified from https://github.com/changesets/action
import fs from 'fs';
import { exec } from './exec.ts';
import { defaultBranch } from './github.ts';

const netrc = `${process.env.HOME}/.netrc`;
const user = 'github-actions[bot]';

export function git(args: string[], options?: Parameters<typeof exec>[2]) {
  return exec('git', args, { stdio: 'inherit', reject: true, ...options });
}

/**
 * Set username and email (as github-actions[bot]) and GitHub credentials (in .netrc).
 * Also set event handlers to try to clean up the credentials on exit.
 */
export async function setCredentials(githubToken: string) {
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

export async function push(branch: string) {
  await git(['push', 'origin', `HEAD:${branch}`]);
}

export async function pushTags() {
  await git(['push', 'origin', '--tags']);
}

/**
 * Switch to the branch, creating it if it doesn't exist
 */
export async function switchToMaybeExistingBranch(branch: string) {
  // for this one, don't throw on error (it's expected if the branch doesn't exist)
  const result = await git(['checkout', branch], { stdio: 'pipe', reject: false });
  if (result.failed) {
    await git(['checkout', '-b', branch]);
  } else {
    console.log('Switched to existing branch', branch);
  }
}

/**
 * Merge with main (accepting main version for any conflicts)
 */
export async function mergeMain(message?: string) {
  await git(['merge', defaultBranch, '--no-edit', '-Xtheirs', ...(message ? ['-m', message] : [])]);
}

export async function tag(tagName: string) {
  await git(['tag', tagName]);
}

export async function reset(pathSpec: string, mode: 'hard' | 'soft' | 'mixed' = 'hard') {
  await git(['reset', `--${mode}`, pathSpec]);
}

export async function commitAll(message: string) {
  await git(['add', '.']);
  await git(['commit', '-m', message]);
}
