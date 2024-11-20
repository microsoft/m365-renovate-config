import fetch from 'node-fetch';
import { pathToFileURL } from 'url';
import { logError } from './utils/github.js';

// Renovate tends to fail silently on invalid tokens in some cases, so this script checks the token.
// It's also good for detecting if an invalid secret name was used.

/** @param {string} token */
export async function checkToken(token) {
  if (!token) {
    throw new Error('GitHub token not provided (is the variable name valid?)');
  }
  if (!/^(gh[a-z]_|github_pat)/i.test(token)) {
    throw new Error(`Value starting with "${token.slice(0, 4)}" is not a GitHub token`);
  }

  /** @type {import('node-fetch').Response} */
  let result;
  try {
    result = await fetch('https://api.github.com/repos/microsoft/m365-renovate-config/branches', {
      headers: { Authorization: `token ${token}` },
    });
  } catch (err) {
    throw new Error('Error checking GitHub token: ' + err);
  }

  if (!result.ok) {
    throw new Error(
      `GitHub token appears to be expired or invalid (received ${result.status} ${result.statusText})`,
    );
  }
}

// ESM version of `if (require.main === module)`
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  (async () => {
    await checkToken(process.argv[2]);
    console.log('Token is valid');
  })().catch((err) => {
    logError(err);
    process.exit(1);
  });
}
