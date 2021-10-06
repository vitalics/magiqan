import type { Status, Kind } from '@magiqan/constants';

export type Test = {
  kind: TestKind;
  fn: Function,
  skip?: boolean;
  name: string | symbol;
  data?: any[],
  isHook: boolean;
  hooks?: Test[];
}

export type TestKind = Kind;
export type ResultKind = Status;
export type Result = Record<string, unknown> & {
  result: ResultKind;
  kind?: TestKind;
  error?: Error | string;
  name: string | symbol;
  isHook?: boolean;
  hooks?: Result[];
  start?: number;
  stop?: number;
};
