import type { Class, Result as ClassResult } from './class';
import type { ResultKind } from './test';

export type File = {
  path: string;
  classes: Class[];
};

export type Result = {
  results: ClassResult[];
  result: ResultKind;
  path: string;
  start?: number;
  stop?: number;
  isRetried?: boolean;
  retries?: number;
}
