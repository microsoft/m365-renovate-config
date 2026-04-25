import fs from 'fs';
import { paths } from './paths.ts';

export function readPackageJson(): { name: string; version: string } {
  return JSON.parse(fs.readFileSync(paths.packageJson, 'utf8'));
}
