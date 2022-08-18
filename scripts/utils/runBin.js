import { execaNode } from 'execa';
import path from 'path';
import { root } from './paths.js';

/**
 * Run a binary provided by a node module
 * @param {string} bin
 * @param {string[]} args
 * @param {import('execa').Options} [opts]
 */
export function runBin(bin, args, opts = {}) {
  const scriptPath = path.join(root, 'node_modules/.bin', bin);
  console.log(`Running: ${bin} ${args.join(' ')}`);
  console.log(`(resolved: node ${scriptPath} ${args.join(' ')})`);
  opts.env && console.log(`(env: ${JSON.stringify(opts.env)} )`);

  return execaNode(scriptPath, args, {
    cwd: root,
    all: true,
    ...opts,
  });
}
