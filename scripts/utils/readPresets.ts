import fs from 'fs';
import jju from 'jju';
import path from 'path';
import { logError } from './github.ts';
import { paths } from './paths.ts';
import type { ConfigData, LocalPresetData } from './types.ts';

const excludeFiles = ['tsconfig.json', 'package.json'];

export const specialConfigNames = {
  serverConfig: 'server config',
  repoConfig: 'repo config',
};

/**
 * Get the contents of the preset files.
 */
export function readPresets(params: { exclude?: string[] } = {}): LocalPresetData[] {
  const excludePresets = params?.exclude ?? [];
  const presetFiles = fs
    .readdirSync(paths.root)
    .filter((file) => /^[^.].*\.json$/.test(file) && !excludeFiles.includes(file));

  if (!presetFiles.length) {
    logError('No presets found under ' + paths.root);
    process.exit(1);
  }

  return presetFiles
    .filter((f) => !excludePresets.includes(path.basename(f, '.json')))
    .map((preset) => {
      const presetName = path.basename(preset, '.json');
      const presetPath = path.join(paths.root, preset);
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
 * All properties will be included for the presets and repo config.
 * The contents are omitted from the server config since it's JS.
 */
export function readPresetsAndConfigs(): ConfigData[] {
  const repoConfigContent = fs.readFileSync(paths.repoRenovateConfig, 'utf8');
  return [
    {
      // repo config
      absolutePath: paths.repoRenovateConfig,
      filename: paths.repoRenovateConfigRel,
      content: repoConfigContent,
      json: jju.parse(repoConfigContent),
      name: specialConfigNames.repoConfig,
    },
    ...readPresets(),
    {
      // server config (omit contents)
      absolutePath: paths.serverConfig,
      name: specialConfigNames.serverConfig,
      filename: paths.serverConfigRel,
    },
  ];
}
