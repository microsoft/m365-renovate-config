import fs from 'fs';
import { runBin } from './runBin.ts';

/**
 * Format a file with Prettier
 */
export async function formatFile(file: string) {
  await runBin('prettier', ['--write', '--log-level=warn', file]);
}

/**
 * Update the file contents and format with Prettier
 */
export async function updateAndFormat(file: string, newContents: string) {
  fs.writeFileSync(file, newContents);
  await formatFile(file);
}
