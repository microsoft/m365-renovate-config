// This file is .ts not .d.ts to ensure proper type checking
// (it only exports types and is never run)
import type { RenovateConfig } from 'renovate/dist/config/types.js';

export type { RenovateConfig };

/**
 * - 10 = trace
 * - 20 = debug
 * - 30 = info
 * - 40 = warn
 * - 50 = error
 * - 60 = fatal
 */
export type RenovateLogLevel = 10 | 20 | 30 | 40 | 50 | 60;

/** Entry in Renovate's log file */
export type RenovateLog = {
  msg: string;
  level: RenovateLogLevel;
  time: string;
  err?: Error & { err?: Error };

  // boring
  name: 'renovate';
  hostname: string;
  pid: number;
  logContext: string;
  v: 0;

  // properties for some log types
  migratedConfig?: any;
  newConfig?: any; // seems equivalent to migratedConfig
  /** Errors in config validation logs (for general caught exceptions, see `err`) */
  errors?: Array<{ topic: string; message: string }>;

  // arbitrary properties allowed
  [key: string]: any;
};

/** Renovate log file entry for preset validation */
export type RenovatePresetDebugLog = RenovateLog & { preset: string };

/** Basic data for a config file or preset */
export type ConfigData = {
  /** Absolute path to the preset file */
  absolutePath: string;
  /** Name of the preset (no extension) */
  name: string;
  /** Filename with extension (relative path in the case of .github/renovate.json5) */
  filename: string;
  /** Content of the preset file. Undefined for server config. */
  content?: string;
  /** Parsed content of the preset file. Undefined for server config. */
  json?: RenovateConfig;
};

export type LocalPresetData = Required<ConfigData>;
