import fs from 'fs';
import jju from 'jju';
import path from 'path';
import { Transform } from 'stream';
import { formatFile } from './utils/formatFile.js';
import { isGithub, logEndGroup, logError, logGroup } from './utils/github.js';
import { readPresets } from './utils/readPresets.js';
import { formatRenovateLog } from './utils/renovateLogs.js';
import { runBin } from './utils/runBin.js';

async function runTests() {
  // Read all the presets to validate. The repo config is included first on the list in this case,
  // because Renovate will always include it along with the other configs (so if it's invalid,
  // all the other configs will also be invalid).
  const presets = readPresets({ includeRepoConfig: true });

  // Use renovate-config-validator to test for blatantly invalid configuration
  // and for configs needing migration.
  // This DOES NOT test validity of preset names in the `extends` configuration.
  for (const [presetPath, { content }] of Object.entries(presets)) {
    const presetName = path.basename(presetPath);
    logGroup(`Validating ${presetName}`);

    const configProcess = runBin('renovate-config-validator', [], {
      env: {
        RENOVATE_CONFIG_FILE: presetPath,
        LOG_FORMAT: 'json', // log as JSON to make it easier to determine if migration is needed
      },
    });

    let migratedConfig;
    configProcess.all
      .pipe(
        new Transform({
          transform(chunk, encoding, callback) {
            // format the JSON logs as nice text (to be sent to stdout) and detect if this log
            // contains the `migratedConfig` property indicating that the config needs migration
            try {
              const json = JSON.parse(chunk.toString());
              if (json.migratedConfig) {
                migratedConfig = json.migratedConfig;
              }
              callback(null, formatRenovateLog(json, true) + '\n');
            } catch (err) {
              callback(null, chunk.toString());
            }
          },
        })
      )
      .pipe(process.stdout);

    if ((await configProcess).failed) {
      process.exitCode = 1;
      logError(`Error validating "${presetName}" (see logs above for details)`, presetName);
    } else if (migratedConfig) {
      const migratedContent = jju.update(content, migratedConfig, {
        indent: 2,
        mode: path.extname(presetPath) === '.json5' ? 'cjson' : 'json',
      });
      if (isGithub) {
        // github run => fail and log how to update the config
        logError(`"${presetName}" requires migration`, presetName);
        console.log('Migrated config:');
        console.log(migratedContent);
        process.exitCode = 1;
      } else {
        // local run => do the updates
        console.log(`Migrating "${presetName}"`);
        fs.writeFileSync(presetPath, migratedContent);
        formatFile(presetPath);
      }
    }

    logEndGroup();
  }
}

runTests().catch((err) => {
  console.error(err.stack || err);
  process.exit(1);
});
