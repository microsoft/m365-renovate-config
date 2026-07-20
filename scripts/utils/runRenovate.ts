import { execa, type Options, type ResultPromise } from 'execa';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { paths } from './paths.ts';
import { getRenovateEnv, type RenovateEnvParams } from './renovateLogs.ts';
import { runBin } from './runBin.ts';

let renovateDir: string | undefined;

/**
 * Run Renovate in a temp directory. Must call `installRenovateTemp` first.
 */
export function runRenovate(
  bin: 'renovate' | 'renovate-config-validator',
  params: RenovateEnvParams & { options?: Options },
): ResultPromise {
  const { options, ...envParams } = params;

  if (!renovateDir) {
    throw new Error('You must call installRenovateTemp() before running Renovate');
  }

  return runBin(bin, [], {
    env: getRenovateEnv(envParams),
    ...options,
    cwd: renovateDir,
  });
}

/**
 * Install Renovate in a temp directory.
 *
 * Using this approach instead of having the repo depend on Renovate directly reduces the ongoing
 * overhead of maintenance PRs and dep alerts. The downside is that builds could randomly start
 * failing due to implicit Renovate changes, rather than ones explicitly picked up by dep updates,
 * but this is effectively the same behavior as real repos using the Renovate github app and very
 * low impact in practice.
 */
export async function installRenovateTemp() {
  renovateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'renovate-temp-'));
  console.log(`Created temp directory for Renovate: ${renovateDir}`);

  process.on('exit', () => {
    try {
      renovateDir && fs.rmSync(renovateDir, { recursive: true, force: true });
    } catch (err) {
      console.warn(`Failed to remove temp directory for Renovate: ${renovateDir}`);
    }
  });

  const yarnrcContent = fs.readFileSync(path.join(paths.root, '.yarnrc.yml'), 'utf8');
  fs.writeFileSync(
    path.join(renovateDir, '.yarnrc.yml'),
    yarnrcContent + '\nenableImmutableInstalls: false\nenableProgressBars: false\n',
  );
  fs.cpSync(path.join(paths.root, '.yarn/releases'), path.join(renovateDir, '.yarn/releases'), {
    recursive: true,
  });

  fs.writeFileSync(
    path.join(renovateDir, 'package.json'),
    JSON.stringify({
      name: 'temp-renovate',
      version: '0.0.0',
      private: true,
      license: 'MIT',
      dependencies: { renovate: '*' },
      dependenciesMeta: { re2: { built: true } },
    }),
  );

  await execa('yarn', ['install'], {
    cwd: renovateDir,
    stdio: 'inherit',
    all: false,
    reject: true,
  });

  return renovateDir;
}
installRenovateTemp();
