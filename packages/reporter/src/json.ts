import type {
  ClassResult, ClassTest,
  FileResult, FileTest,
  Test, TestResult,
  Hook, RunnerLike,
} from '@magiqan/types';
import { FileReporter } from './file';

export class JSONReporter extends FileReporter {
  _results: FileResult[] = [];
  constructor(readonly filePath: string) {
    super(filePath);
  }

  onRunnerInit(_runner: RunnerLike, cwd: string) {
    super.onRunnerInit(_runner, cwd);
    this._stream?.write('[');
  }

  onFileResult(fileResult: FileResult) {
    // add ',' symbol at the end of each object
    const stringifyed = JSON.stringify(fileResult, null, 2) + ',';
    this._stream?.write(stringifyed);
  }
  generate() {
    return super.generate(']');
  }

  // inheritance. keep empty 
  onFileRun(_file: FileTest, _runner: RunnerLike): void { }
  onFileParse(_file: FileTest, _runner: RunnerLike): void { }
  onClassRun(_cls: ClassTest, _runner: RunnerLike): void { }
  onClassConstructor(_cls: ClassTest, _instance: any, _runner: RunnerLike): void { }
  onClassHook(_hook: Hook, _cls: ClassTest, _runner: RunnerLike): void { }
  onClassResult(_result: ClassResult, _cls: ClassTest, _runner: RunnerLike): void { }
  onTestRun(_test: Test, _cls: ClassTest, _runner: RunnerLike): void { }
  onTestResult(_result: TestResult, _test: Test, _cls: ClassTest, _runner: RunnerLike): void { }
  onTestMetadata(_cls: ClassTest, _test: Test, _metadata: Record<string, unknown> | undefined): void { }
  onTestEachHookResult(_result: TestResult, _hook: Hook, _test: Test, _cls: ClassTest, _runner: RunnerLike): void { }
  onClassMetadata(_test: ClassTest, _metadata: Record<string, unknown> | undefined): void { }
  onClassHookMetadata(_cls: ClassTest, _test: Hook, _metadata: Record<string, unknown> | undefined): void { }
  onClassEachHook(_hook: Hook, _test: Test, _cls: ClassTest, _runner: RunnerLike): void { }
  onclassHookResult(_result: TestResult, _hook: Hook, _cls: ClassTest, _runner: RunnerLike): void { }
}
