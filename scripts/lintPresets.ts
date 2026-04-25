import { logError } from './utils/github.ts';
import { readPresets } from './utils/readPresets.ts';

const requiredAttributes: Record<string, string> = {
  $schema: 'https://docs.renovatebot.com/renovate-schema.json',
  description: '',
};

const presets = readPresets();

for (const { name: presetName, filename, json } of presets) {
  const logIssue = (message: string) => {
    logError(`${presetName}: ${message}`, filename);
    process.exitCode = 1;
  };

  // Verify required attributes are present (and have the correct value, if relevant)
  for (const [name, value] of Object.entries(requiredAttributes)) {
    const actualValue = (json as any)[name];
    if (!actualValue) {
      logIssue(`missing required attribute "${name}"`);
    } else if (value && actualValue !== value) {
      logIssue(`attribute "${name}" must be "${value}"`);
    }
  }
}
