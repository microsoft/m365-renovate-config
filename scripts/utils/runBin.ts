import { execa, type Options, type ResultPromise } from 'execa';
import { paths } from './paths.ts';

const defaults: Options = {
  preferLocal: true,
  cwd: paths.root,
  stdio: 'inherit',
  all: true,
  reject: true,
};

/**
 * Run a binary provided by a node module (see {@link defaults})
 */
export function runBin(bin: string, args: string[], opts?: Options): ResultPromise {
  console.log(`Running: ${bin} ${args.join(' ')}`);
  return execa(bin, args, { ...defaults, ...opts });
}
