/** @import { ConfigData, LocalPresetData } from './types.js' */
import fs from 'fs';
import jju from 'jju';
import path from 'path';
import { logError, repoRenovateConfigPath } from './github.js';
import { root } from './paths.js';

const excludeFiles = ['tsconfig.json', 'package.json'];
const repoConfigAbsPath = path.join(root, repoRenovateConfigPath);
const serverConfigPath = 'scripts/serverConfig.js';
const serverConfigAbsPath = path.join(root, serverConfigPath);

export const specialConfigNames = {
  serverConfig: 'server config',
  repoConfig: 'repo config',
};

/**
 * Get the contents of the preset files.
 * @param {Object} param0
 * @param {string[]} [param0.exclude] presets names to exclude
 * @returns {LocalPresetData[]}
 */
export function readPresets({ exclude: excludePresets = [] } = {}) {
  const presetFiles = fs
    .readdirSync(root)
    .filter((file) => /^[^.].*\.json$/.test(file) && !excludeFiles.includes(file));

  if (!presetFiles.length) {
    logError('No presets found under ' + root);
    process.exit(1);
  }

  return presetFiles
    .filter((f) => !excludePresets.includes(f))
    .map((preset) => {
      const presetName = path.basename(preset, '.json');
      const presetPath = path.join(root, preset);
      const content = fs.readFileSync(presetPath, 'utf8');
      return {
        absolutePath: presetPath,
        name: presetName,
        filename: preset,
        content,
        json: JSON.parse(content),
      };
    });
}

/**
 * Get the contents of the repo config, preset files, and server config.
 * The repo config will always be first in the array.
 * @returns {ConfigData[]} Presets and configs.
 * All properties will be included for the presets and repo config.
 * The contents are omitted from the server config since it's JS.
 */
export function readPresetsAndConfigs() {
  const repoConfigContent = fs.readFileSync(repoConfigAbsPath, 'utf8');
  return [
    {
      // repo config
      absolutePath: repoConfigAbsPath,
      filename: repoRenovateConfigPath,
      content: repoConfigContent,
      json: jju.parse(repoConfigContent),
      name: specialConfigNames.repoConfig,
    },
    ...readPresets(),
    {
      // server config (omit contents)
      absolutePath: serverConfigAbsPath,
      name: specialConfigNames.serverConfig,
      filename: serverConfigPath,
    },
  ];
}
