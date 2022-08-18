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

  // arbitrary properties allowed
  [key: string]: any;
};
