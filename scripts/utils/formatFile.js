import { spawnSync } from 'child_process';

/**
 * Format a file with Prettier
 * @param {string} file path to file
 */
export function formatFile(file) {
  const res = spawnSync('yarn', ['prettier', '--write', '--loglevel=warn', file], {
    stdio: 'pipe',
  });
  if (res.status !== 0) {
    throw new Error(`Failed to run prettier on ${file}: ${res.stderr.toString()}`);
  }
}
