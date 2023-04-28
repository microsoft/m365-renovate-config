import { runBin } from './runBin.js';

/**
 * Format a file with Prettier
 * @param {string} file path to file
 * @param {Parameters<typeof runBin>[2]} [options]
 */
export async function formatFile(file, options = {}) {
  await runBin('prettier', ['--write', '--loglevel=warn', file], {
    stdio: 'pipe',
    reject: true,
    ...options,
  });
}
