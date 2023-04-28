import assert from 'assert';
import path from 'path';
import { defaultRepo } from './github.js';

export const repoPresetRegex = new RegExp(
  `^github>${defaultRepo}(?::(\\w+)(?:\\(.*?\\))?)?(?:#.*)?$`
);

// run quick tests on module load to verify the regex didn't break
runTests();

/**
 * If `extendsStr` points to a preset from this repo, get its name.
 * Returns undefined otherwise. (Doesn't verify that the preset name exists.)
 * @param {string} extendsStr
 */
export function getLocalPresetFromExtends(extendsStr) {
  const match = extendsStr.match(repoPresetRegex);
  return match ? match[1] || 'default' : undefined;
}

/**
 * Add `ref` to the end of `extendsStr`, replacing any existing ref.
 * @param {string} extendsStr
 * @param {string} ref
 */
export function setExtendsRef(extendsStr, ref) {
  return extendsStr.replace(/($|#.*)/, `#${ref}`);
}

/**
 * Get a reference to a local preset for use in an `extends` config.
 * (Doesn't verify that the preset name exists.)
 * @param {string} preset Preset name or path (basename will be used)
 * @param {string} [ref]
 */
export function getExtendsForLocalPreset(preset, ref) {
  const presetName = path.basename(preset, '.json');
  const presetRef = ref ? `#${ref}` : '';
  return `github>${defaultRepo}:${presetName}${presetRef}`;
}

function runTests() {
  const tests = [
    [`github>${defaultRepo}`, 'default'],
    [`github>${defaultRepo}:automergeTypes`, 'automergeTypes'],
    [`github>${defaultRepo}:restrictNode(14)`, 'restrictNode'],
  ];

  const refTests = tests.map(([str, preset]) => [str + '#v123', preset]);

  for (const [extnds, preset] of [...tests, ...refTests]) {
    const res1 = getLocalPresetFromExtends(extnds);
    const resStr = JSON.stringify(res1);
    assert.strictEqual(
      res1,
      preset,
      `Expected getLocalPresetFromExtends("${extnds}") to return "${preset}". Got: ${resStr}`
    );

    const res2 = setExtendsRef(extnds, 'v456');
    const withRef = extnds.includes('#v123') ? extnds.replace('#v123', '#v456') : extnds + '#v456';
    assert.strictEqual(
      res2,
      withRef,
      `Expected setExtendsRef("${extnds}", "v456") to return "${withRef}". Got: "${res2}"`
    );
  }
}
