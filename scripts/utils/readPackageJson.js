import fs from 'fs';
import path from 'path';
import { root } from './paths.js';

/**
 * @returns {{ name: string; version: string }}
 */
export function readPackageJson() {
  return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
}
