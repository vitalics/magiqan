import type { Ctor } from './_internal';
import type { ResultKind, Test, Result as TestResult } from './test';

export type Class = {
  name: string;
  skip?: boolean;
  hooks: Test[],
  tests: Test[];
  ctor: Ctor,
};

export type Result = {
  name: string;
  results: TestResult[];
  ctor: Ctor;
  result: ResultKind;
  instance?: any;
  start?: number;
  stop?: number;
}