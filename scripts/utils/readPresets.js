import fs from 'fs';
import jju from 'jju';
import path from 'path';
import { logError, repoRenovateConfigPath } from './github.js';
import { root } from './paths.js';

const excludeFiles = ['jsconfig.json', 'package.json'];
const repoConfigAbsPath = path.join(root, repoRenovateConfigPath);

/**
 * Get the contents of the preset files and optionally the repo Renovate config.
 * If the repo config is included, it will be first in the array (needed for basic tests).
 * @param {Object} param0
 * @param {boolean} [param0.includeRepoConfig] whether to include .github/renovate.json5
 * @param {string[]} [param0.exclude] presets names to exclude
 * @returns {import('./types.js').LocalPresetData[]}
 */
export function readPresets({ includeRepoConfig, exclude: excludePresets = [] } = {}) {
  const presetFiles = fs
    .readdirSync(root)
    .filter((file) => /^[^.].*\.json$/.test(file) && !excludeFiles.includes(file));

  if (!presetFiles.length) {
    logError('No presets found under ' + root);
    process.exit(1);
  }

  const presets = /** @type {import('./types.js').LocalPresetData[]} */ ([]);

  if (includeRepoConfig) {
    const content = fs.readFileSync(repoConfigAbsPath, 'utf8');
    presets.push({
      absolutePath: repoConfigAbsPath,
      filename: repoRenovateConfigPath,
      content,
      json: jju.parse(content),
      name: 'repo config',
    });
  }

  for (const preset of presetFiles) {
    const presetName = path.basename(preset, '.json');
    if (!excludePresets.includes(presetName)) {
      const presetPath = path.join(root, preset);
      const content = fs.readFileSync(presetPath, 'utf8');
      presets.push({
        absolutePath: presetPath,
        name: presetName,
        filename: preset,
        content,
        json: JSON.parse(content),
      });
    }
  }

  return presets;
}
