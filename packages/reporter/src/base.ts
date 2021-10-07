import events from '@magiqan/events';
import type {
  ClassResult, ClassTest,
  FileResult, FileTest,
  Test, TestResult,
  RunnerLike,
} from '@magiqan/types';

export abstract class Reporter {

  /** Raw results. Can be remap for reporter purpuse */
  _results: FileResult[] = [];
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
    events.subscribe('fileResult', (runner, result) => {
      this.onFileResult(result, runner);
    });
  }

  onInit(_runner: RunnerLike) { }
  onFileRun(_file: FileTest, _runner: RunnerLike) { }
  onFileParse(_file: FileTest, _runner: RunnerLike) { }
  onFileResult(result: FileResult, _runner: RunnerLike) {
    this._results.push(result);
  }
  onClassRun(_cls: ClassTest, _runner: RunnerLike) { }
  onClassConstructor(_cls: ClassTest, _instance: any, _runner: RunnerLike) { }
  onClassResult(_result: ClassResult, _cls: ClassTest, _runner: RunnerLike): void { };
  onTestRun(_test: Test, _cls: ClassTest, _runner: RunnerLike) { }
  onTestResult(_result: TestResult, _test: Test, _cls: ClassTest, _runner: RunnerLike) { }
  onTestMetadata(_test: Test, _metadata: Test['metadata']) { }
  onHookMetadata(_test: Test, _metadata: Test['metadata']) { }
  onClassMetadata(_test: ClassTest, _metadata: Test['metadata']) { }
}
