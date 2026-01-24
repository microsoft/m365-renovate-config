import fs from 'fs';
import { paths } from './paths.js';

/**
 * @returns {{ name: string; version: string }}
 */
export function readPackageJson() {
  return JSON.parse(fs.readFileSync(paths.packageJson, 'utf8'));
}
