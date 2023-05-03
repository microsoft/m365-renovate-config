import fs from 'fs';
import jju from 'jju';
import { readPresets } from '../utils/readPresets.js';
import { formatFile } from '../utils/formatFile.js';
import { setExtendsRefs } from '../utils/extends.js';
import { updateReadme } from '../updateReadme.js';

/**
 * Fix repo references in presets to reflect the new ref (usually a branch name)
 * and update the readme.
 * @param {string} ref
 */
export async function updateRefs(ref) {
  const presets = readPresets();

  for (const { json, content, absolutePath } of presets) {
    if (json.extends) {
      json.extends = setExtendsRefs(json.extends, ref);
    }
    if (json.ignorePresets) {
      json.ignorePresets = setExtendsRefs(json.ignorePresets, ref);
    }
    fs.writeFileSync(absolutePath, jju.update(content, json, { indent: 2 }));
  }

  // format the presets (jju uses a different style)
  await formatFile('*.json');

  // update the readme to reflect the new refs
  await updateReadme();
}

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
