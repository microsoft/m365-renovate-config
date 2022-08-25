import { spawnSync } from 'child_process';
import { logError } from './utils/github.js';

// Renovate tends to fail silently on invalid tokens in some cases, so this script checks the token.
// It's also good for detecting if an invalid secret name was used.

const token = process.argv[2];
if (!token) {
  logError('GitHub token not provided (is the variable name valid?)');
  process.exit(1);
}

const curlResult = spawnSync('curl', [
  '-s',
  '-w',
  '%{http_code}',
  '-H',
  `Authorization: token ${token}`,
  'https://api.github.com/',
]);
const stdout = curlResult.stdout.toString();
const stderr = curlResult.stderr.toString();
if (curlResult.status !== 0) {
  logError('Error executing curl command: ' + stderr);
  process.exit(1);
}
const httpCode = Number(stdout.split('\n').slice(-1)[0]);
if (httpCode !== 200) {
  logError('GitHub token appears to be expired or invalid');
  console.log(stdout);
  console.log(stderr);
  process.exit(1);
}
