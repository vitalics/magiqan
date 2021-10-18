import 'reflect-metadata';

import { Kind, metadata, Status } from '@magiqan/constants';
import { events, Event } from '@magiqan/events';
import type { TestResult, Internal, RunnerLike, ClassTest, Test, Hook } from '@magiqan/types';

import { Runner } from '../runner';

import { constructInstanceIfNeeded } from './construct';
import delay from './delay';

export async function runFunction<A extends any[] = [], This = unknown>(this: This, fn: Function, ...args: A): Promise<TestResult> {
  const result = { start: Date.now(), result: Status.PENDING, name: '', metadata: undefined, } as TestResult;
  // NOTE: abort controller for nodejs@14 is experimental
  const abortController = new AbortController();
  try {
    await Promise.race<TestResult>([
      delay(Runner.timeout, abortController.signal),
      Reflect.apply(fn, this || globalThis, args),
    ]);
    return { ...result, result: Status.PASSED, stop: Date.now() } as TestResult;
  } catch (error) {
    if (error instanceof Error) {
      return { ...result, result: Status.FAILED, error: error.stack, stop: Date.now() } as TestResult;
    }
    return { ...result, result: Status.FAILED, error, stop: Date.now() } as TestResult;
  } finally {
    abortController.abort();
  }
}

export async function runClassMethodWithHooks<R>(this: RunnerLike, ctor: Internal.Ctor<R>, method: string, withGlobalHooks = false) {
  const instance = constructInstanceIfNeeded.call(this, ctor);
  const classTest: ClassTest = Reflect.getMetadata(metadata.CLASS_KEY, ctor.prototype);

  const test = classTest.tests.find(t => t.name === method);
  if (!test) {
    throw new Error(`${ctor.name} is no marked with @test() decorator`);
  }

  const result: TestResult = { name: method, result: Status.PENDING, start: Date.now(), metadata: undefined, isHook: false, kind: Kind.test };

  const isHaveAnyHooks = (test.hooks && Array.isArray(test.hooks) && test.hooks.length > 0) || (classTest.hooks && Array.isArray(classTest.hooks) && classTest.hooks.length > 0);

  if (isHaveAnyHooks) {
    if (withGlobalHooks) {
      const beforeAllResults = await runHooks.call(this, classTest, Kind.beforeAll);
      const isAnyBeforeAllHookFailed = beforeAllResults.some(r => r.result === Status.FAILED);
      // do not run test if any beforeAll hook failed
      if (isAnyBeforeAllHookFailed) {
        return { ...result, hooks: [...beforeAllResults], result: Status.SKIPPED, stop: Date.now() };
      }
      result.hooks = [...(result.hooks || []), ...beforeAllResults];
    }

    const beforeEachResults = await runHooks.call(this, classTest, Kind.beforeEach);
    const isAnyBeforeEachHookFailed = beforeEachResults.some(r => r.result === Status.FAILED);
    // do not run test if any beforeEach hook failed
    if (isAnyBeforeEachHookFailed) {
      return { ...result, hooks: [...(result.hooks || []), ...beforeEachResults], result: Status.SKIPPED, stop: Date.now() };
    }
    result.hooks = [...(result.hooks || []), ...beforeEachResults];

  }

  // run test
  const testResult = await runFunction.call(instance, test.fn!, ...test.data!);

  // find metadata for runned test
  const metadataObject: Test[] = Reflect.getMetadata(metadata.TEST_KEY, ctor.prototype);
  const testMetadata = metadataObject.find(t => t.name === method);

  result.result = testResult.result;
  result.stop = testResult.stop;
  result.metadata = { ...result.metadata, ...testMetadata?.metadata };
  if (testResult.result === Status.FAILED) {
    result.error = testResult.error;
  }

  // run afterEach hooks
  if (isHaveAnyHooks) {
    const afterEachResults = await runHooks.call(this, classTest, Kind.afterEach);
    const isAnyAfterEachHookFailed = afterEachResults.some(r => r.result === Status.FAILED);
    // set broken status if any afterEach hook failed
    if (isAnyAfterEachHookFailed) {
      result.result = Status.BROKEN;
    }
    result.hooks = [...(result.hooks || []), ...afterEachResults];


    if (withGlobalHooks) {
      const afterAllResults = await runHooks.call(this, classTest, Kind.afterAll);
      const isAnyAfterAllHookFailed = afterAllResults.some(r => r.result === Status.FAILED);

      // set broken status if any afterEach hook failed
      if (isAnyAfterAllHookFailed) {
        result.result = Status.BROKEN;
      }
      result.hooks = [...(result.hooks || []), ...afterAllResults];
    }
  }

  return result;
}


export async function runHooks(this: RunnerLike, classTest: ClassTest, kind: Test['kind']): Promise<TestResult[]> {

  const isntance = constructInstanceIfNeeded.call(this, classTest.ctor!);
  const classMetaValue: ClassTest = Reflect.getMetadata(metadata.CLASS_KEY, classTest.ctor!.prototype);
  const hooks = classMetaValue.hooks?.filter(h => h.kind === kind);
  if (!hooks) {
    return [];
  }
  const skippedHooks = hooks.filter(h => h.skip);
  const runnedHooks = hooks.filter(h => !h.skip);
  const result: TestResult[] = [];
  skippedHooks.forEach(k => result.push({ result: Status.SKIPPED, name: k.name, isHook: true, kind: k.kind }));
  const hookRunResult: TestResult[] = await Promise.all(runnedHooks.map(async h => {
    events.emit(new Event('classHook', { runner: this, class: classTest, hook: h }));
    const result = await runFunction.call(isntance, h.fn!);

    // global hook: append result
    const hookMetadata: Hook[] = Reflect.getMetadata(metadata.HOOK_KEY, classTest.ctor!.prototype);
    const findedHook = hookMetadata.find(h => h.name === h.name);
    if (findedHook) {
      result.metadata = findedHook.metadata;
    }

    const hookResult = { ...result, isHook: true, name: h.name, kind: h.kind, stop: Date.now(), };

    events.emit(new Event('classMethodResult', { runner: this, class: classTest, hook: h, result: hookResult }));
    return { ...hookResult, name: h.name };
  }));
  result.push(...hookRunResult);
  return result;
}
