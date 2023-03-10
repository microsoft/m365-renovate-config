import path from 'path';

export const defaultRepo = 'microsoft/m365-renovate-config';
export const defaultBranch = 'main';
export const primaryBranches = [defaultBranch, 'v1'];
export const isGithub = !!process.env.CI;
/** Relative path to the repo renovate config */
export const repoRenovateConfigPath = '.github/renovate.json5';

/**
 * In CI, log an error with the github workflow command format so it shows up in the summary
 * and possibly pointing to the specific file. Logs normally in local runs.
 * @param {string} err Error text
 * @param {string} [file] Source file. If provided with no extension, ".json" will be appended.
 * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions}
 */
export function logError(err, file) {
  logOther('error', err, file);
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
  console.log(isGithub ? `::group::${name}` : name);
}

/**
 * In CI, end a log group using github workflow commands. Logs an empty line in local runs.
 */
export function logEndGroup() {
  console.log(isGithub ? '::endgroup::' : '');
}
