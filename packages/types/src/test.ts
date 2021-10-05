export type Test = {
  kind: TestKind;
  fn: Function,
  skip?: boolean;
  name: string | symbol;
  data?: any[],
  isHook: boolean;
  hooks?: Test[];
}

export type TestKind = 'test' | 'beforeAll' | 'beforeEach' | 'afterAll' | 'afterEach'
export type ResultKind = 'passed' | 'failed' | 'skipped' | 'broken' | 'pending';
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
