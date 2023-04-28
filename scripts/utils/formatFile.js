import { runBin } from './runBin.js';

/**
 * Format a file with Prettier
 * @param {string} file path to file
 */
export async function formatFile(file) {
  await runBin('prettier', ['--write', '--loglevel=warn', file], {
    stdio: 'pipe',
    reject: true,
  });
}
