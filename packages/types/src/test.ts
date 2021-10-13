import type { Status, Kind } from '@magiqan/constants';

export type Hook = Omit<Test, 'hooks'>;

export type Test = {
  kind: TestKind;
  fn?: Function,
  skip?: boolean;
  name: string | symbol;
  data?: any[],
  isHook: boolean;
  hooks?: Hook[];
  metadata?: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
};
