import type { Result as TestResult, Test } from './test'
import type { Result as ClassResult, Class as ClassTest } from './class';
import type { Result as FileResult, File as FileTest } from './file';
import type { RunnerLike } from './runner';

export type Map = {
  readonly runnerInit: [runner: RunnerLike];
  // file events
  readonly runFile: [runner: RunnerLike, file: FileTest];
  readonly fileParsed: [runner: RunnerLike, result: FileTest];
  readonly fileResult: [runner: RunnerLike, result: FileResult];
  // class events
  readonly runClass: [runner: RunnerLike, test: ClassTest];
  readonly classConstructor: [runner: RunnerLike, test: ClassTest, instance: any];
  readonly classResult: [runner: RunnerLike, cls: ClassTest, result: ClassResult];
  readonly classMetadata: [cls: ClassTest, metadata: Record<string, unknown>];
  // hooks
  readonly classHook: [runner: RunnerLike, cls: ClassTest, hook: Test];
  readonly classHookMetadata: [cls: ClassTest, hook: Test, metadata: Record<string, unknown>];
  readonly classHookResult: [runner: RunnerLike, cls: ClassTest, hook: Test, result: TestResult];
  readonly classEachHook: [runner: RunnerLike, cls: ClassTest, test: Test, hook: Test];
  readonly classEachHookResult: [runner: RunnerLike, cls: ClassTest, test: Test, hook: Test, hookResult: TestResult];
  // test
  readonly classMethod: [runner: RunnerLike, cls: ClassTest, test: Test];
  readonly classMethodMetadata: [cls: ClassTest, test: Test, metadata: Record<string, unknown>];
  readonly classMethodResult: [runner: RunnerLike, cls: ClassTest, test: Test, result: TestResult];
  // TODO: workers
  readonly allWorkerStart: []
  readonly workerStart: []
  readonly workerEnd: []
  readonly allWorkerEnd: []
};

export type Names = keyof Map;