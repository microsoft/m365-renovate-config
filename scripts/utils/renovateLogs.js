/** @import { RenovateLog, RenovateLogLevelName, RenovateLogLevelValue } from './types.js' */

import fs from 'fs';
import { logEndGroup, logGroup } from './github.js';

/** @type {Record<RenovateLogLevelValue, string>} */
const logLevelStrings = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
};

/**
 *
 * @param {object} params
 * @param {RenovateLogLevelName} [params.logLevel] Log level for console output (default info)
 * @param {'json'|'pretty'} [params.logFormat] Log format for console output (default pretty)
 * @param {string} [params.logFile] Path to a log file
 * @param {RenovateLogLevelName} [params.logFileLevel] Log level for the log file
 * @param {'json'|'pretty'} [params.logFileFormat] Log format for the log file (default json)
 * @param {string} [params.configFile] Path to the config file
 * @returns {Record<string, string>} Environment variables to set for Renovate
 */
export function getRenovateEnv({
  logLevel,
  logFormat,
  logFile,
  logFileLevel,
  logFileFormat,
  configFile,
}) {
  return {
    ...(logLevel && { LOG_LEVEL: logLevel }),
    ...(logFormat && { LOG_FORMAT: logFormat }),
    ...(logFile && { LOG_FILE: logFile }),
    ...(logFileLevel && { LOG_FILE_LEVEL: logFileLevel }),
    ...(logFileFormat && { LOG_FILE_FORMAT: logFileFormat }),
    ...(configFile && { RENOVATE_CONFIG_FILE: configFile }),
  };
}

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
      } catch {
        // ignore
      }
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
