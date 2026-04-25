import fs from 'fs';
import jju from 'jju';
import { updateReadme } from '../updateReadme.ts';
import { setExtendsRefs } from '../utils/extends.ts';
import { formatFile } from '../utils/formatFile.ts';
import { readPresets } from '../utils/readPresets.ts';

/**
 * Fix repo references in presets to reflect the new ref (usually a branch name)
 * and update the readme.
 */
export async function updateRefs(ref: string) {
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
