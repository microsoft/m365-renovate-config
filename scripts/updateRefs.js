import fs from 'fs';
import jju from 'jju';
import { defaultRepo } from './utils/github.js';
import { readPresets } from './utils/readPresets.js';

const ref = process.argv[2];
if (!ref) {
  console.error('Ref (tag or branch) not passed on command line');
  process.exit(1);
}

// fix repo references in presets to reflect the new ref
const presets = readPresets();

for (const [presetFile, { content, json }] of Object.entries(presets)) {
  if (json.extends) {
    json.extends = /** @type {string[]} */ (json.extends).map((preset) =>
      // if it's a preset in this repo, either add the ref to the end or replace the existing ref
      preset.includes(defaultRepo) ? preset.replace(/($|#.*)/, `#${ref}`) : preset
    );
  }
  fs.writeFileSync(presetFile, jju.update(content, json, { indent: 2 }));
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
