import type { Result as TestResult } from './test';
import type { Result as ClassResult, } from './class';
import type { Result as FileResult } from './file';
import type { Ctor } from './_internal';

export type RunnerLike = {
  run(): Promise<(FileResult | undefined)[]>;
  runFile(filePath: string): Promise<FileResult | undefined>;
  /**
   * Run class which marked with `@testable`
   *
   * @param {Ctor} ctor
   * @return {*}  {Promise<ClassResult>}
   */
  runClass(ctor: Ctor): Promise<ClassResult>;
  /**
   * Run class method with `each` hooks which marked with `@test`
   *
   * @param {Ctor} ctor
   * @param {string} testName
   * @return {*}  {Promise<Result>}
   */
  runClassTest(ctor: Ctor, testName: string): Promise<TestResult>;
  setDefaultTimeout(ms: number): void;
  resetTimeout(): void;
};
