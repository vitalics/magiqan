import type { Result as TestResult, Test } from './test'
import type { Result as ClassResult, Class as ClassTest } from './class';
import type { Result as FileResult, File as FileTest, File } from './file';
import type { RunnerLike } from './runner';
import type { Logger, LogLevel } from './logger';

export type Map = {
  // common
  readonly runnerInit: Event<'runnerInit', { runner: RunnerLike, cwd: string }>;
  readonly runnerRun: Event<'runnerRun', { runner: RunnerLike, files: File[] }>;
  readonly runnerRunEnd: Event<'runnerRunEnd', { runner: RunnerLike, files: File[], results: FileResult[] }>;
  readonly log: Event<'log', { namespace: string, timestamp: Date, level: LogLevel, logger: Logger, message: string, args?: unknown[] }>;
  // file events
  readonly runFile: Event<'runFile', { runner: RunnerLike, file: FileTest }>;
  readonly fileParsed: Event<'fileParsed', { runner: RunnerLike, result: FileTest }>;
  readonly fileResult: Event<'fileResult', { runner: RunnerLike, result: FileResult }>;
  readonly runnerDestroy: Event<'runnerDestroy', { runner: RunnerLike, result: FileResult }>;
  // class events
  readonly runClass: Event<'runClass', { runner: RunnerLike, class: ClassTest }>;
  readonly classConstructor: Event<'classConstructor', { runner: RunnerLike, class: ClassTest, instance: any }>;
  readonly classResult: Event<'classResult', { runner: RunnerLike, class: ClassTest, result: ClassResult }>;
  readonly classMetadata: Event<'classMetadata', { class: ClassTest, metadata: Record<string, unknown> }>;
  // hooks
  readonly classHook: Event<'classHook', { runner: RunnerLike, class: ClassTest, hook: Test }>;
  readonly classHookMetadata: Event<'classHookMetadata', { class: ClassTest, hook: Test, metadata: Record<string, unknown> }>;
  readonly classHookResult: Event<'classHookResult', { runner: RunnerLike, class: ClassTest, hook: Test, result: TestResult }>;
  readonly classEachHook: Event<'classEachHook', { runner: RunnerLike, class: ClassTest, test: Test, hook: Test }>;
  readonly classEachHookResult: Event<'classEachHookResult', { runner: RunnerLike, class: ClassTest, test: Test, hook: Test, result: TestResult }>;
  // test
  readonly classMethod: Event<'classMethod', { runner: RunnerLike, class: ClassTest, test: Test }>;
  readonly classMethodMetadata: Event<'classMethodMetadata', { class: ClassTest, test: Test, metadata: Record<string, unknown> }>;
  readonly classMethodResult: Event<'classMethodResult', { runner: RunnerLike, class: ClassTest, test: Test, result: TestResult }>;
  // TODO: workers
  readonly allWorkerStart: Event<'allWorkerStart', {}>;
  readonly workerStart: Event<'workerStart', {}>;
  readonly workerEnd: Event<'workerEnd', {}>;
  readonly allWorkerEnd: Event<'allWorkerEnd', {}>;
};

export type Names = keyof Map;

export type Event<N extends string, T> = {
  name: N;
  payload: T;
};
