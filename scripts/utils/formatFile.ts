// this is a CJS module which causes interop issues
import prettier from 'prettier';
import { runBin } from './runBin.ts';

/**
 * Format a file with Prettier
 */
export async function formatFile(file: string, options: Parameters<typeof runBin>[2] = {}) {
  await runBin('prettier', ['--write', '--loglevel=warn', file], {
    stdio: 'inherit',
    reject: true,
    ...options,
  });
}

/**
 * Cached Prettier config. In theory this could vary between files, but in this repo it shouldn't.
 */
let config: prettier.Options | null | undefined;
/**
 * Format file contents with Prettier
 */
export async function formatFileContents(filepath: string, contents: string) {
  if (!config) {
    config = await prettier.resolveConfig(filepath);
    if (!config) {
      throw new Error(`Could not resolve prettier config for ${filepath}`);
    }
  }
  return prettier.format(contents, { filepath, ...config });
}
