import type { Ctor } from './_internal';
import type { ResultKind, Test, Result as TestResult, Hook } from './test';

export type Class = {
  name: string;
  skip?: boolean;
  hooks: Hook[],
  tests: Test[];
  ctor: Ctor,
  metadata?: Record<string, unknown>;
};

export type Result = {
  name: string;
  results: TestResult[];
  ctor: Ctor;
  result: ResultKind;
  instance?: any;
  start?: number;
  stop?: number;
  metadata?: Record<string, unknown>;
}
