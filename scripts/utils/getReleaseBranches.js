import { readPackageJson } from './readPackageJson.js';

/**
 * Get the list of major version release branches that should currently exist
 * (based on the major version of the package).
 */
export function getReleaseBranches() {
  const version = readPackageJson().version;
  const major = Number(version.split('.')[0]);
  const branches = /** @type {string[]} */ ([]);
  for (let i = 1; i <= major; i++) {
    branches.push(`v${i}`);
  }
  return branches;
}

/**
 * Get the major release branch from a version.
 * @param {string} version
 */
export function getReleaseBranchFromVersion(version) {
  const major = Number(version.split('.')[0]);
  if (isNaN(major)) {
    // in case it's called with a range or something
    throw new Error(`getReleaseBranch must be called with a specific version, not "${version}"`);
  }
  return `v${major}`;
}
