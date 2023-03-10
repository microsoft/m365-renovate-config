import fs from 'fs';
import { logEndGroup, logGroup } from './github.js';

/**
 * @typedef {import('./types.js').RenovateLog} RenovateLog
 * @typedef {import('./types.js').RenovateLogLevel} RenovateLogLevel
 */

/**
 * Renovate log level values
 */
export const RENOVATE_LOG_LEVELS = /** @type {const} */ ({
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
});
const logLevelStrings = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
  60: 'FATAL',
};

/**
 * Read a Renovate log file, which has entries in JSON format.
 * @param {string} logFile
 * @returns {RenovateLog[]}
 */
export function readRenovateLogs(logFile) {
  // Each line in the log file is a JSON blob
  return fs
    .readFileSync(logFile, 'utf8')
    .trim()
    .split(/\r?\n/g)
    .map((str) => {
      try {
        return JSON.parse(str);
      } catch (err) {}
    })
    .filter((l) => !!l);
}

/** @param {RenovateLog} log */
export function logRenovateErrorDetails(log) {
  const { err } = log;
  if (!err) return;

  logGroup('Error details');

  // Typically the inner error in Renovate logs is the one with interesting content.
  // For example, if a preset name is invalid, this is where you'll find the 404 HTTPError.
  const innerError = /** @type {(Error & Record<string, any>) | undefined} */ (err.err);
  if (innerError?.name === 'HTTPError') {
    console.log(`HTTP error requesting ${innerError.options?.url}`);
    console.log(innerError.message);
  }

  // The outer error will likely have a better stack in the case of async HTTP errors
  console.log('\nOuter error:');
  console.log(err.stack);

  if (innerError) {
    console.log('\nOriginal error:');
    console.log(JSON.stringify(innerError, null, 2));
  }

  logEndGroup();
}

/**
 * @param {RenovateLog} log
 * @param {boolean} [all] whether to print all the extra properties
 * (exception: for logs with errors, always prints all properties)
 */
export function formatRenovateLog(log, all) {
  // destructure a bunch of extra properties to get rid of them from the logged object
  const { msg, level, time, name, hostname, pid, logContext, v, ...rest } = log;

  // basic message and level (like what Renovate logs)
  let res = `${logLevelStrings[level].padEnd(5)} ${msg}`;

  if ((all && Object.keys(rest).length) || rest.err) {
    // add the extra properties in a format similar to what Renovate uses
    // (JSON but with start and end braces removed)
    res += '\n' + JSON.stringify(rest, null, 2).split('\n').slice(1, -1).join('\n');
  }
  return res;
}
