import { execa } from 'execa';
import { paths } from './paths.js';

/**
 * @param {string} file
 * @param {string[]} args
 * @param {import('execa').Options & { quiet?: boolean }} [opts]
 */
export function exec(file, args, opts = {}) {
  const { quiet, ...execOpts } = opts;
  !quiet && console.log(`Running: ${file} ${args.join(' ')}`);
  !quiet && opts.env && console.log(`(env: ${JSON.stringify(opts.env)} )`);

  return execa(file, args, {
    cwd: paths.root,
    all: true,
    reject: false, // don't throw on failure
    ...execOpts,
  });
}
