
export type Config = {
  workers?: number; // if defined will use workers
  shareWorkerEnv?: boolean;
  // reporters
  reporter?: string; // TODO: define Reporter object instead of string
  outputDir?: string; // output reporter directory

  // logger
  log?: boolean;
  logLevel?: string;

  // commons
  env?: Record<string, string | undefined>;
  debug?: boolean;
  files: string[]; // files to be run
  exclude?: string[]; // files to be excluded from run
  timeout?: number; // timeout for each async test;
}
