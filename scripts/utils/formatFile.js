import { spawnSync } from 'child_process';

/**
 * Format a file with Prettier
 * @param {string} file path to file
 */
export function formatFile(file) {
  spawnSync('yarn', ['prettier', '--write', file], { stdio: 'inherit' });
}
