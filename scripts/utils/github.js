import path from 'path';
import { getEnv } from './getEnv.js';

export const defaultRepoDetails = { owner: 'microsoft', repo: 'm365-renovate-config' };
export const defaultRepo = `${defaultRepoDetails.owner}/${defaultRepoDetails.repo}`;
export const defaultBranch = 'main';
export const isGithub = !!process.env.CI;
/** Branch name if running on github (via `GITHUB_REF`) */
export const githubBranchName = getEnv('GITHUB_REF', isGithub)?.replace('refs/heads/', '');

/**
 * In CI, log an error with the github workflow command format so it shows up in the summary
 * and possibly pointing to the specific file. Logs normally in local runs.
 * @param {unknown} err Error
 * @param {string} [file] Source file. If provided with no extension, ".json" will be appended.
 * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions}
 */
export function logError(err, file) {
  logOther('error', /** @type {Error} */ (err).stack || String(err), file);
}

/**
 * In CI, log a message with the github workflow command format so it shows up in the summary
 * and possibly pointing to the specific file. Logs normally in local runs.
 * @param {'error' | 'warning' | 'notice'} level
 * @param {string} text
 * @param {string} [file] Source file. If provided with no extension, ".json" will be appended.
 * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions}
 */
export function logOther(level, text, file) {
  file = file && !path.extname(file) ? `${file}.json` : file;
  const method =
    level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
  method(isGithub ? `::${level} ${file ? ` file=${file}` : ''}::${text}` : text);
}

/**
 * In CI, start a log group using github workflow commands. Logs normally in local runs.
 * @param {string} name Group name
 */
export function logGroup(name) {
  console.log(isGithub ? `::group::${name}` : `${name}\n`);
}

/**
 * In CI, end a log group using github workflow commands. Logs an empty line in local runs.
 */
export function logEndGroup() {
  console.log(isGithub ? '::endgroup::\n' : '');
}
