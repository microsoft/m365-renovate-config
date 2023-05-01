import fs from 'fs';
import { readPresets } from './utils/readPresets.js';
import {
  getComments,
  getHeadingText,
  getMarkedSection,
  slugify,
  splitByHeading,
} from './utils/markdown.js';
import { formatFileContents } from './utils/formatFile.js';
import { logError } from './utils/github.js';
import { git } from './utils/git.js';

const readmeFile = 'README.md';
const check = process.argv.includes('--check');

/**
 * @typedef {{
 *   name: string;
 *   nameWithArgs: string;
 *   content: string;
 * }} PresetSection
 * @typedef {{
 *   name: string;
 *   presets: (string | RegExp)[];
 *   rest?: boolean;
 * }} PresetGroup
 * @typedef {{ [presetName: string]: string }} PresetExtraTexts
 */

const excludedPresets = [
  'beachballLibraryRecommended',
  'beachballLibraryVerbose',
  'libraryRecommended',
];

/** @type {PresetGroup[]} */
const presetGroups = [
  {
    name: 'Full config presets',
    presets: ['default', 'beachball'],
  },
  {
    name: 'Grouping presets',
    presets: ['groupMore', /^group/],
  },
  {
    name: 'Compatibility presets',
    presets: ['disableEsmVersions', 'restrictNode'],
  },
  {
    // This group MUST be last!
    name: 'Other presets',
    presets: [],
    rest: true,
  },
];

const comments = {
  /** Wraps all the generated presets content (except the table of contents) */
  main: getComments('presets'),
  /** Wraps the presets table of contents (should be *outside* the main comments) */
  toc: getComments('presets TOC'),
  /** Wraps extra content within each preset's docs */
  extra: getComments('extra content', 'EDITABLE between these comments'),
};
const requiredComments = /** @type {string[]} */ ([]).concat(
  ...[comments.main, comments.toc].map(({ start, end }) => [start, end])
);

/**
 * Get any extra text added for each preset
 * @param {string[]} presetNames
 * @param {string} presetsSection
 */
function getPresetExtraTexts(presetNames, presetsSection) {
  /** @type {PresetExtraTexts} */
  const presetExtraTexts = {};
  splitByHeading(presetsSection, 4)
    .slice(1) // remove the first part, which will be an h3
    .forEach((text) => {
      const presetName = getHeadingText(text, 4)
        .replace(/`/g, '')
        .replace(/\(.*\)$/, ''); // remove args
      if (!presetName) {
        console.warn('Section REMOVED since it did not match expected format:\n', text);
      } else if (!presetNames.includes(presetName)) {
        console.warn(`Section "${presetName}" REMOVED since a matching file was not found`);
      } else if (!text.includes(comments.extra.start) || !text.includes(comments.extra.end)) {
        console.warn(`Section "${presetName}" REMOVED since marker comments are missing`);
      } else {
        presetExtraTexts[presetName] = getMarkedSection(text, comments.extra);
      }
    });
  return presetExtraTexts;
}

async function updateReadme() {
  // read the readme and replace newlines for ease of processing
  const originalReadme = fs.readFileSync(readmeFile, 'utf8').replace(/\r?\n/g, '\n');

  const missingComments = requiredComments.filter((comment) => !originalReadme.includes(comment));
  if (missingComments.length) {
    console.error(
      `Readme is missing section marker comment(s):\n  ${missingComments.join('  \n')}`
    );
    process.exit(1);
  }

  const presets = readPresets({ exclude: excludedPresets });
  const presetNames = presets.map((p) => p.name);

  const presetsSection = getMarkedSection(originalReadme, comments.main);

  const presetExtraTexts = getPresetExtraTexts(presetNames, presetsSection);

  // Generate preset sections based on the descriptions, custom text, and other JSON
  const newPresets = presets.map(({ name, content, json }) => {
    const presetArgs = content.match(/{{arg\d}}/g);
    const presetNameWithArgs = presetArgs
      ? `${name}(${presetArgs.map((arg) => `<${arg.slice(2, -2)}>`).join(', ')})`
      : name;
    const extraContent = presetExtraTexts[name] || '';

    const { description, $schema, ...otherJson } = json;
    const modifiedJson = JSON.stringify(otherJson, null, 2);

    return {
      name,
      nameWithArgs: presetNameWithArgs,
      content: `
#### \`${presetNameWithArgs}\`

${description || ''}

<details><summary><b>Show config JSON</b></summary>

\`\`\`json
${modifiedJson}
\`\`\`

</details>

${comments.extra.start}
${extraContent}
${comments.extra.end}

---
`,
    };
  });

  // Group the presets into sections
  const remainingPresets = [...newPresets];
  const newPresetGroups = presetGroups.map((group) => {
    const { name, presets: presetsToGroup, rest } = group;
    const includedPresets = /** @type {PresetSection[]} */ ([]);

    if (rest) {
      // catch-all case: add all remaining presets to the group
      includedPresets.push(...remainingPresets);
    } else {
      // normal case: find the matching preset names and add to the group
      for (const presetName of presetsToGroup) {
        if (typeof presetName === 'string') {
          const presetIndex = remainingPresets.findIndex((p) => p.name === presetName);
          if (presetIndex === -1) {
            console.warn(`Missing preset "${presetName}" for group "${name}"`);
          } else {
            includedPresets.push(remainingPresets.splice(presetIndex, 1)[0]);
          }
        } else {
          // presetName is a regex, so find the matching items
          const matchingPresets = remainingPresets.filter((p) => presetName.test(p.name));
          includedPresets.push(...matchingPresets);
          // remove them from the remaining items
          matchingPresets.forEach((p) => remainingPresets.splice(remainingPresets.indexOf(p), 1));
        }
      }
    }

    return {
      name,
      presets: includedPresets,
      content: [`### ${name}`, '', ...includedPresets.map((p) => p.content)].join('\n'),
    };
  });

  // Generate the TOC for the presets
  const oldToc = getMarkedSection(originalReadme, comments.toc);
  const newToc = newPresetGroups
    .map((group) =>
      [
        `- [${group.name}](#${slugify(group.name)})`,
        ...group.presets.map((p) => `  - [${p.name}](#${slugify(p.nameWithArgs)})`),
      ].join('\n')
    )
    .join('\n');

  // Update readme and format
  const newReadme = await formatFileContents(
    readmeFile,
    originalReadme
      .replace(presetsSection, newPresetGroups.map((g) => g.content).join('\n'))
      .replace(oldToc, newToc)
  );

  if (newReadme.trim() === originalReadme.trim()) {
    console.log('\nReadme is up to date!\n');
  } else if (check) {
    await git(['diff', readmeFile]);
    throw new Error(
      "Readme is out of date (see above for diff). Please run 'yarn update-readme' and commit the changes."
    );
  } else {
    fs.writeFileSync(readmeFile, newReadme);
    console.log('\nUpdated readme!\n');
  }
}

updateReadme().catch((err) => {
  console.error(err.stack || err);
  logError(err.message || err);
  process.exit(1);
});
