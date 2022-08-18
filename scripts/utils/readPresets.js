import fs from 'fs';
import jju from 'jju';
import path from 'path';
import { logError } from './github.js';
import { root } from './paths.js';

const excludeFiles = ['jsconfig.json', 'package.json'];
const repoConfigPath = path.join(root, '.github/renovate.json5');

/**
 * @param {Object} param0
 * @param {boolean} [param0.includeRepoConfig] whether to include .github/renovate.json5
 * @param {string[]} [param0.exclude] presets names to exclude
 * @returns {Record<string, { content: string; json: any }>} mapping from preset absolute path to content
 */
export function readPresets({ includeRepoConfig, exclude = [] } = {}) {
  const presetFiles = fs
    .readdirSync(root)
    .filter((file) => /^[^.].*\.json$/.test(file) && !excludeFiles.includes(file));

  if (!presetFiles.length) {
    logError('No presets found under ' + root);
    process.exit(1);
  }

  const presets = /** @type {*} */ ({});

  if (includeRepoConfig) {
    // In the config validation test, it's important that the repo config is the first key so that
    // if it needs migration, it will be updated before the other presets are validated (because
    // there's no way to prevent Renovate from validating the repo config along with each preset)
    const content = fs.readFileSync(repoConfigPath, 'utf8');
    presets[repoConfigPath] = { content, json: jju.parse(content) };
  }

  for (const preset of presetFiles) {
    if (!exclude.includes(path.basename(preset, '.json'))) {
      const presetPath = path.join(root, preset);
      const content = fs.readFileSync(presetPath, 'utf8');
      presets[presetPath] = { content, json: JSON.parse(content) };
    }
  }

  return presets;
}
