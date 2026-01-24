import { execaNode } from 'execa';
import path from 'path';
import { paths } from './paths.js';

/**
 * Run a binary provided by a node module
 * @param {string} bin
 * @param {string[]} args
 * @param {import('execa').Options & { quiet?: boolean }} [opts]
 */
export function runBin(bin, args, opts = {}) {
  const { quiet, ...execOpts } = opts;
  const scriptPath = path.join(paths.root, 'node_modules/.bin', bin);
  !quiet && console.log(`Running: ${bin} ${args.join(' ')}`);
  !quiet && console.log(`(resolved: node ${scriptPath} ${args.join(' ')})`);
  !quiet && opts.env && console.log(`(env: ${JSON.stringify(opts.env)} )`);

  return execaNode(scriptPath, args, {
    cwd: paths.root,
    all: true,
    reject: false, // don't throw on failure
    ...execOpts,
  });
}
