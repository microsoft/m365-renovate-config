// this is a CJS module which causes interop issues
import prettier from 'prettier';
import { runBin } from './runBin.js';

/**
 * Format a file with Prettier
 * @param {string} file path to file
 * @param {Parameters<typeof runBin>[2]} [options]
 */
export async function formatFile(file, options = {}) {
  await runBin('prettier', ['--write', '--loglevel=warn', file], {
    stdio: 'inherit',
    reject: true,
    ...options,
  });
}

/**
 * Cached Prettier config. In theory this could vary between files, but in this repo it shouldn't.
 * @type {import('prettier').Options | null | undefined}
 */
let config;
/**
 * Format file contents with Prettier
 * @param {string} filepath
 * @param {string} contents
 */
export async function formatFileContents(filepath, contents) {
  if (!config) {
    config = await prettier.resolveConfig(filepath);
    if (!config) {
      throw new Error(`Could not resolve prettier config for ${filepath}`);
    }
  }
  return prettier.format(contents, { filepath, ...config });
}
