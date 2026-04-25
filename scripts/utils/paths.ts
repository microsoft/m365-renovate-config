import path from 'path';

const root = path.resolve(import.meta.dirname, '../..');
const repoRenovateConfigRel = '.github/renovate.json5';
const serverConfigRel = 'scripts/serverConfig.js';

/** Useful paths, all absolute unless otherwise noted */
export const paths = {
  /** Repo root */
  root,
  changelog: path.join(root, 'CHANGELOG.md'),
  packageJson: path.join(root, 'package.json'),
  /** Relative path from repo root to renovate config */
  repoRenovateConfigRel,
  /** The repo's own renovate config */
  repoRenovateConfig: path.join(root, repoRenovateConfigRel),
  /** Relative path from repo root to test server config */
  serverConfigRel,
  /** Test server config */
  serverConfig: path.join(root, serverConfigRel),
  /** Config validation log file for basic tests */
  logFileBasic: path.join(root, 'renovate.validate.log'),
  /** Dry run log file for full tests */
  logFileFull: path.join(root, 'renovate.log'),
};
