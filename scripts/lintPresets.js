import { logError } from './utils/github.js';
import { readPresets } from './utils/readPresets.js';

const requiredAttributes = {
  $schema: 'https://docs.renovatebot.com/renovate-schema.json',
  description: '',
};

const presets = readPresets();

for (const { name: presetName, filename, json } of presets) {
  const logIssue = (/** @type {*} */ message) => {
    logError(`${presetName}: ${message}`, filename);
    process.exitCode = 1;
  };

  // Verify required attributes are present (and have the correct value, if relevant)
  for (const [name, value] of Object.entries(requiredAttributes)) {
    const actualValue = /** @type {*} */ (json)[name];
    if (!actualValue) {
      logIssue(`missing required attribute "${name}"`);
    } else if (value && actualValue !== value) {
      logIssue(`attribute "${name}" must be "${value}"`);
    }
  }
}
