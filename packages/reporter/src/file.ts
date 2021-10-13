/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createWriteStream, WriteStream } from 'fs';
import { resolve } from 'path';

import type {
  ClassResult, ClassTest,
  FileResult, FileTest,
  Test, TestResult,
  Hook, RunnerLike,
} from '@magiqan/types';

import { Reporter } from './base';

export class FileReporter extends Reporter {

  protected _stream: WriteStream | null = null;
  protected file = '';
  constructor(readonly filePath: string) {
    super();
  }
  onRunnerInit(_runner: RunnerLike, cwd: string) {
    this.file = resolve(cwd, this.filePath);
    this._stream = createWriteStream(this.file, { flags: 'w+' });
  }
  async generate(data?: any) {
    this._stream?.end(data);
  }
  // inheritance. 
  onRunnerRun(_files: FileTest[], _runner: RunnerLike): void | Promise<void> { }
  onRunnerRunEnd(_results: FileResult[], _files: FileTest[], _runner: RunnerLike): void | Promise<void> { }
  onFileRun(_file: FileTest, _runner: RunnerLike): void { }
  onFileParse(_file: FileTest, _runner: RunnerLike): void { }
  onFileResult(_result: FileResult, _runner: RunnerLike): void | Promise<void> { }
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
