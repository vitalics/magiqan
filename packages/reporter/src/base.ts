import events from '@magiqan/events';
import type { ClassResult, ClassTest, FileResult, FileTest, RunnerLike, Test, TestResult } from '@magiqan/types';

export abstract class Reporter {

  /** Raw results. Can be remap for reporter purpuse */
  protected _results: FileResult[] = [];
  /**
   * Generates result
   * 
   * @see {import('./json').Reporter}
   *
   * @abstract
   * @return {*}  {Promise<void>}
   * @memberof Reporter
   */
  abstract generate(outFile: string): Promise<void>;

  constructor() {
    events.subscribe('fileResult', (_runner, result) => {
      this._results.push(result);
    });
  }

  onInit(_runner: RunnerLike) { }
  onFileRun(_file: FileTest, _runner: RunnerLike) { }
  onFileParse(_file: FileTest, _runner: RunnerLike) { }
  onFileResult(_result: FileResult, _runner: RunnerLike) { }
  onClassRun(_cls: ClassTest, _runner: RunnerLike) { }
  onClassConstructor(_cls: ClassTest, _instance: any, _runner: RunnerLike) { }
  onClassResult(_result: ClassResult, _cls: ClassTest, _runner: RunnerLike): void { };
  onTestRun(_test: Test, _cls: ClassTest, _runner: RunnerLike) { }
  onTestResult(_result: TestResult, _test: Test, _cls: ClassTest, _runner: RunnerLike) { }
}
