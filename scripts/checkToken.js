import fetch from 'node-fetch';
import { getEnv } from './utils/getEnv.js';

// Renovate tends to fail silently on invalid tokens in some cases, so this script checks the token.
// It's also good for detecting if an invalid secret name was used.

/**
 * Get the TOKEN environment variable, if set. The CI pipeline sets another variable TOKEN_REQUIRED
 * which will cause accessing this to throw if the token isn't present.
 */
export function getToken() {
  return getEnv('TOKEN', !!process.env.TOKEN_REQUIRED);
}

export async function checkToken(token = getToken()) {
  if (!token) {
    throw new Error('GitHub token not provided (is the variable name valid?)');
  }
  if (!/^(gh[a-z]_|github_pat)/i.test(token)) {
    throw new Error(`Value starting with "${token.slice(0, 4)}" is not a GitHub token`);
  }

  /** @type {import('node-fetch').Response} */
  let result;
  try {
    result = await fetch('https://api.github.com', {
      headers: { Authorization: `Bearer ${token}` },
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
