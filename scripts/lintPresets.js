import path from 'path';
import { logError } from './utils/github.js';
import { readPresets } from './utils/readPresets.js';

const requiredAttributes = {
  $schema: 'https://docs.renovatebot.com/renovate-schema.json',
  description: '',
};

const presets = readPresets();

for (const [presetPath, { json }] of Object.entries(presets)) {
  const logIssue = (message) => {
    const presetName = path.basename(presetPath, '.json');
    logError(`${presetName}: ${message}`, `${presetName}.json`);
    process.exitCode = 1;
  };

  // Verify required attributes are present (and have the correct value, if relevant)
  for (const [name, value] of Object.entries(requiredAttributes)) {
    if (!json[name]) {
      logIssue(`missing required attribute "${name}"`);
    } else if (value && json[name] !== value) {
      logIssue(`attribute "${name}" must be "${value}"`);
    }
  }
}
