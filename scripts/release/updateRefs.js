import fs from 'fs';
import jju from 'jju';
import { readPresets } from '../utils/readPresets.js';
import { formatFile } from '../utils/formatFile.js';
import { getLocalPresetFromExtends, setExtendsRef } from '../utils/extends.js';

/**
 * Fix repo references in presets to reflect the new ref (usually a branch name).
 * @param {string} ref
 */
export async function updateRefs(ref) {
  const presets = readPresets();

  for (const { json, content, absolutePath } of presets) {
    if (json.extends) {
      json.extends = /** @type {string[]} */ (json.extends).map((preset) =>
        // if it's a preset in this repo, either add the ref to the end or replace the existing ref
        getLocalPresetFromExtends(preset) ? setExtendsRef(preset, ref) : preset
      );
    }
    fs.writeFileSync(absolutePath, jju.update(content, json, { indent: 2 }));
  }

  // format the presets (jju uses a different style)
  await formatFile('*.json');

  // // fix repo references in config files to reflect the repo/branch being tested
  // const headRef = /** @type {string} */ (process.env.GITHUB_HEAD_REF);
  // const repo = /** @type {string} */ (process.env.GITHUB_REPOSITORY);
  // if (headRef !== 'main' || repo !== defaultRepo) {
  //   for (const [presetFile, { content, json }] of Object.entries(presets)) {
  //     if (json.extends) {
  //       json.extends = json.extends.map((preset) => {
  //         preset = preset.replace(defaultRepo, repo);
  //         if (headRef !== 'main') {
  //           preset += `#${headRef}`;
  //         }
  //         return preset;
  //       });
  //     }
  //     fs.writeFileSync(presetFile, jju.update(content, json, { indent: 2 }));
  //   }
  // }
}
