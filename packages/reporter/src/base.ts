import events from '@magiqan/events';
import type {
  ClassResult, ClassTest,
  FileResult, FileTest,
  Test, TestResult,
  RunnerLike,
  Hook,
} from '@magiqan/types';


export abstract class Reporter {

  /**
   * Generates result
   * 
   * @see {import('./json').Reporter}
   *
   * @abstract
   * @return {*}  {Promise<void | Promise<void>>}
   * @memberof Reporter
   */
  abstract generate(): void | Promise<void>;

  constructor() {
    // subscribe to all events
    // runner
    events.subscribe('runnerInit', (r, cwd) => {
      this.onRunnerInit(r, cwd);
    });
    // file evetns
    events.subscribe('fileResult', (runner, result) => {
      this.onFileResult(result, runner);
    });
    events.subscribe('fileParsed', (runner, result) => {
      this.onFileParse(result, runner);
    });
    events.subscribe('runFile', (runner, file) => {
      this.onFileRun(file, runner);
    });
    // class events. 12 events total
    events.subscribe('runClass', (runner, clas) => {
      this.onClassRun(clas, runner);
    });
    events.subscribe('classConstructor', (runner, test, instance) => {
      this.onClassConstructor(test, instance, runner)
    });
    events.subscribe('classHook', (runner, cls, hook) => {
      this.onClassHook(hook, cls, runner);
    });
    events.subscribe('classMetadata', (cls, metadata) => {
      this.onClassMetadata(cls, metadata);
    });
    events.subscribe('classHookMetadata', (cls, test, metadata) => {
      this.onClassHookMetadata(cls, test, metadata);
    });
    events.subscribe('classMethod', (runner, cls, test) => {
      this.onTestRun(test, cls, runner)
    });
    events.subscribe('classMethodMetadata', (cls, test, metadata) => {
      this.onTestMetadata(cls, test, metadata)
    });
    events.subscribe('classMethodResult', (runner, cls, test, result) => {
      this.onTestResult(result, test, cls, runner);
    });
    events.subscribe('classEachHookResult', (runner, cls, test, hook, result) => {
      this.onTestEachHookResult(result, hook, test, cls, runner);
    });
    events.subscribe('classEachHook', (runner, cls, test, hook) => {
      this.onClassEachHook(hook, test, cls, runner);
    });
    events.subscribe('classHookResult', (runner, cls, hook, result) => {
      this.onclassHookResult(result, hook, cls, runner)
    });
    events.subscribe('classResult', (runner, cls, result) => {
      this.onClassResult(result, cls, runner);
    });
  }
  // TODO: add docs for each method

  abstract onRunnerInit(runner: RunnerLike, cwd: string): void | Promise<void> | Promise<void | Promise<void>>;
  abstract onFileRun(file: FileTest, runner: RunnerLike): void | Promise<void>;
  abstract onFileParse(file: FileTest, runner: RunnerLike): void | Promise<void>;
  abstract onFileResult(result: FileResult, runner: RunnerLike): void | Promise<void>;
  abstract onClassRun(cls: ClassTest, runner: RunnerLike): void | Promise<void>;
  abstract onClassConstructor(cls: ClassTest, instance: any, runner: RunnerLike): void | Promise<void>;
  abstract onClassHook(hook: Hook, cls: ClassTest, runner: RunnerLike): void | Promise<void>;
  abstract onClassResult(result: ClassResult, cls: ClassTest, runner: RunnerLike): void | Promise<void>;
  abstract onTestRun(test: Test, cls: ClassTest, runner: RunnerLike): void | Promise<void>;
  abstract onTestResult(result: TestResult, test: Test, cls: ClassTest, runner: RunnerLike): void | Promise<void>;
  abstract onTestMetadata(cls: ClassTest, test: Test, metadata: Test['metadata']): void | Promise<void>;
  abstract onTestEachHookResult(result: TestResult, hook: Hook, test: Test, cls: ClassTest, runner: RunnerLike): void | Promise<void>;
  abstract onClassMetadata(test: ClassTest, metadata: Test['metadata']): void | Promise<void>;
  abstract onClassHookMetadata(cls: ClassTest, test: Hook, metadata: Test['metadata']): void | Promise<void>;
  abstract onClassEachHook(hook: Hook, test: Test, cls: ClassTest, runner: RunnerLike): void | Promise<void>;
  abstract onclassHookResult(result: TestResult, hook: Hook, cls: ClassTest, runner: RunnerLike): void | Promise<void>;
}
