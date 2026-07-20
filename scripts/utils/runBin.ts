import { execa, type Options, type ResultPromise } from 'execa';
import { paths } from './paths.ts';
import { getRenovateEnv, type RenovateEnvParams } from './renovateLogs.ts';

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

/**
 * Run Renovate via `yarn dlx`.
 */
export function runRenovate(
  bin: 'renovate' | 'renovate-config-validator',
  params: RenovateEnvParams & { options?: Options },
): ResultPromise {
  const { options, ...envParams } = params;
  return execa('yarn', ['dlx', '-p', 'renovate', bin], {
    env: getRenovateEnv(envParams),
    ...defaults,
    ...options,
  });
}
