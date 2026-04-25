import { execa, type Options } from 'execa';
import { paths } from './paths.ts';

export function exec(file: string, args: string[], opts: Options & { quiet?: boolean } = {}) {
  const { quiet, ...execOpts } = opts;
  !quiet && console.log(`Running: ${file} ${args.join(' ')}`);
  !quiet && opts.env && console.log(`(env: ${JSON.stringify(opts.env)} )`);

  return execa(file, args, {
    cwd: paths.root,
    all: true,
    reject: false,
    ...execOpts,
  });
}
