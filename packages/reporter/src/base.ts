import { events } from '@magiqan/events';
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
    events.subscribe('runnerInit', async ({ cwd, runner }) => {
      await this.onRunnerInit(runner, cwd);
    });
    events.subscribe('runnerRun', async ({ runner, files }) => {
      await this.onRunnerRun(files, runner);
    });
    events.subscribe('runnerRunEnd', async ({ runner, files, results }) => {
      await this.onRunnerRunEnd(results, files, runner);
    });
    // file evetns
    events.subscribe('fileResult', async ({ result, runner }) => {
      await this.onFileResult(result, runner);
    });
    events.subscribe('fileParsed', async ({ result, runner }) => {
      await this.onFileParse(result, runner);
    });
    events.subscribe('runFile', async ({ file, runner }) => {
      await this.onFileRun(file, runner);
    });
    // class events. 12 events total
    events.subscribe('runClass', async payload => {
      await this.onClassRun(payload.class, payload.runner);
    });
    events.subscribe('classConstructor', async payload => {
      await this.onClassConstructor(payload.class, payload.instance, payload.runner)
    });
    events.subscribe('classHook', async payload => {
      await this.onClassHook(payload.hook, payload.class, payload.runner);
    });
    events.subscribe('classMetadata', async payload => {
      await this.onClassMetadata(payload.class, payload.metadata);
    });
    events.subscribe('classHookMetadata', async payload => {
      await this.onClassHookMetadata(payload.class, payload.hook, payload.metadata);
    });
    events.subscribe('classMethod', async payload => {
      await this.onTestRun(payload.test, payload.class, payload.runner);
    });
    events.subscribe('classMethodMetadata', async payload => {
      await this.onTestMetadata(payload.class, payload.test, payload.metadata)
    });
    events.subscribe('classMethodResult', async payload => {
      await this.onTestResult(payload.result, payload.test, payload.class, payload.runner);
    });
    events.subscribe('classEachHookResult', async payload => {
      await this.onTestEachHookResult(payload.result, payload.hook, payload.test, payload.class, payload.runner);
    });
    events.subscribe('classEachHook', async payload => {
      await this.onClassEachHook(payload.hook, payload.test, payload.class, payload.runner);
    });
    events.subscribe('classHookResult', async payload => {
      await this.onclassHookResult(payload.result, payload.hook, payload.class, payload.runner)
    });
    events.subscribe('classResult', async payload => {
      await this.onClassResult(payload.result, payload.class, payload.runner);
    });
  }
  // TODO: add docs for each method

  abstract onRunnerInit(runner: RunnerLike, cwd: string): void | Promise<void>;
  abstract onRunnerRun(files: FileTest[], runner: RunnerLike): void | Promise<void>;
  abstract onRunnerRunEnd(results: FileResult[], files: FileTest[], runner: RunnerLike): void | Promise<void>;
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
