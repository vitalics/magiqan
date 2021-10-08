import events from '@magiqan/events';
import type {
  ClassResult, ClassTest,
  FileResult, FileTest,
  Test, TestResult,
  Hook,
  RunnerLike,
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
  abstract generate(): Promise<void>;

  constructor() {
    // subscribe to all events
    // runner
    events.subscribe('runnerInit', async (r, cwd) => {
      await this.onRunnerInit(r, cwd);
    });
    // file evetns
    events.subscribe('fileResult', async (runner, result) => {
      await this.onFileResult(result, runner);
    });
    events.subscribe('fileParsed', async (runner, result) => {
      await this.onFileParse(result, runner);
    });
    events.subscribe('runFile', async (runner, file) => {
      await this.onFileRun(file, runner);
    });
    // class events. 12 events total
    events.subscribe('runClass', async (runner, clas) => {
      await this.onClassRun(clas, runner);
    });
    events.subscribe('classConstructor', async (runner, test, instance) => {
      await this.onClassConstructor(test, instance, runner)
    });
    events.subscribe('classHook', async (runner, cls, hook) => {
      await this.onClassHook(hook, cls, runner);
    });
    events.subscribe('classMetadata', async (cls, metadata) => {
      await this.onClassMetadata(cls, metadata);
    });
    events.subscribe('classHookMetadata', async (cls, test, metadata) => {
      await this.onClassHookMetadata(cls, test, metadata);
    });
    events.subscribe('classMethod', async (runner, cls, test) => {
      await this.onTestRun(test, cls, runner)
    });
    events.subscribe('classMethodMetadata', async (cls, test, metadata) => {
      await this.onTestMetadata(cls, test, metadata)
    });
    events.subscribe('classMethodResult', async (runner, cls, test, result) => {
      await this.onTestResult(result, test, cls, runner);
    });
    events.subscribe('classEachHookResult', async (runner, cls, test, hook, result) => {
      await this.onTestEachHookResult(result, hook, test, cls, runner);
    });
    events.subscribe('classEachHook', async (runner, cls, test, hook) => {
      await this.onClassEachHook(hook, test, cls, runner);
    });
    events.subscribe('classHookResult', async (runner, cls, hook, result) => {
      await this.onclassHookResult(result, hook, cls, runner)
    });
    events.subscribe('classResult', async (runner, cls, result) => {
      await this.onClassResult(result, cls, runner);
    });
  }
  // TODO: add docs for each method

  abstract onRunnerInit(runner: RunnerLike, cwd: string): void | Promise<void>;
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
