/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'reflect-metadata';
import { SHARE_ENV, Worker } from 'worker_threads';
import { resolve } from 'path';
import { types, promisify } from 'util';
import { setTimeout } from 'timers';

import glob = require('glob');
import type {
  Test, TestResult,
  FileResult,
  ClassResult,
  RunnerLike,
  ClassTest,
  Internal,
  FileTest,
  Hook,
} from '@magiqan/types';
import {
  metadata,
  Kind,
  Status,
} from '@magiqan/constants';
import { events, Event } from '@magiqan/events';
import { logger } from '@magiqan/logger';

import delay from './delay';

const globAsync = promisify(glob);
const defaultTimeout = 5000;
const timeout = promisify(setTimeout);

const log = logger('@magiqans/runner');

export class Runner implements RunnerLike {
  static timeout = defaultTimeout;
  constructor(readonly cwd = process.cwd()) { }
  private _allPaths: string[] = [];
  private _hasInitBefore = false;

  protected _currentFile?: FileTest;
  protected _currentClass?: ClassTest;

  private _init(): void {
    this._hasInitBefore = true;
    log.debug('Runner._init()');
    events.emit(new Event('runnerInit', { runner: this, cwd: this.cwd }));
  }

  setDefaultTimeout(timeout: number) {
    Runner.timeout = timeout;
  }

  resetTimeout() {
    Runner.timeout = defaultTimeout;
  }

  addFile(filePath: string) {
    this._appendFile(filePath);
  }
  async addGlob(globPattern: string) {
    const paths = await globAsync(globPattern);
    paths.forEach(f => this._appendFile(f));
  }
  addFiles(filePaths: string[]) {
    filePaths.forEach(this._appendFile)
  }

  private _appendFile(file: string) {
    const resolved = resolve(this.cwd, file)
    log.debug(`append file ${resolved}`);
    this._allPaths.push(resolved);
  }

  async runAsync() {
    log.warn('Runner.runAsync() is experimantal, use Runner.run() method instead');
    if (!this._hasInitBefore) {
      this._init();
    }
    const results: FileResult[] = [];
    this._allPaths.forEach(path => {
      const worker = new Worker(resolve(__dirname, './worker.js'), {
        workerData: path,
        env: SHARE_ENV,
      });
      worker.on('message', (data: FileResult) => {
        results.push(data);
        worker.terminate();
      });
      worker.on('exit', () => {
        worker.terminate();
      });
    });
    // wait until results emitted
    while (results.length !== this._allPaths.length) {
      await timeout(100); // short worker delay
    }
    return results;
  }
  async run(): Promise<(FileResult | undefined)[]> {
    log.debug('Runner.run() %o', this._allPaths);
    if (!this._hasInitBefore) {
      this._init();
    }
    if (this._allPaths.length === 0) {
      return [];
    }

    // map paths to file test
    const files = this._allPaths.map(path => {
      return { classes: [], path, } as FileTest;
    });

    const coldResults: FileResult[] = files.map(f => ({ path: f.path, start: Date.now(), result: Status.PENDING, results: [] }));

    const results = await Promise.all(
      files.map(async f => {
        this._currentFile = f;
        const coldResult: FileResult = coldResults.find(r => r.path === f.path)!;
        const result = { ...coldResult, ...await this.runFile(f) };
        this._currentFile = undefined;
        return result;
      }));
    return results;
  }

  async runFile(filePathOrTest: string | FileTest): Promise<FileResult | undefined> {
    log.debug(`Runner.runFile(${filePathOrTest})`);
    if (!this._hasInitBefore) {
      this._init();
    }
    let realPath = '';
    if (!isFileTest(filePathOrTest)) {
      realPath = resolve(this.cwd, filePathOrTest);
    } else {
      realPath = filePathOrTest.path;
    }
    const imported: Record<string, unknown> = await import(realPath);
    const fileTest: FileTest = {
      classes: [],
      path: realPath,
    };
    this._currentFile = fileTest;
    events.emit(new Event('runFile', { runner: this, file: fileTest }));

    const fileResult: FileResult = {
      path: realPath,
      results: [],
      result: Status.PENDING,
    };
    const classTests: (ClassTest | undefined)[] = await Promise.all(Object.entries(imported).map(async ([, value]) => {
      if (
        typeof value === 'function' &&
        Reflect.hasMetadata(metadata.CLASS_KEY, value.prototype)
      ) {
        return Reflect.getMetadata(metadata.CLASS_KEY, value.prototype) as ClassTest;
      } else {
        return;
      }
    }));
    const findedTests = classTests.filter(t => t !== undefined) as ClassTest[];
    if (!findedTests || !Array.isArray(findedTests) || findedTests.length === 0) {
      console.log('No test classes maked with @testable');
      return;
    }
    fileTest.classes.push(...findedTests);

    events.emit(new Event('fileParsed', { runner: this, file: fileTest }));

    const results: ClassResult[] = await Promise.all(fileTest.classes.map(async cls => {
      if (cls.skip) {
        // TODO: collect all tests maked as `@test` and add to results
        return { result: 'skipped', results: [], ctor: cls.ctor, name: cls.name, } as ClassResult;
      }
      const classResult = await this.runClass(cls.ctor);
      return classResult;
    }));

    fileResult.results.push(...results);
    const isEveryTestClassPassed = results.every(r => r.result === 'passed');
    const isEveryTestClassSkipped = results.every(r => r.result === 'skipped');
    const isSomeTestClassFailed = results.some(r => r.result === 'failed');
    const isSomeTestClassBroken = results.some(r => r.result === 'broken');
    if (isSomeTestClassFailed) {
      fileResult.result = Status.FAILED;
    } else if (isEveryTestClassPassed) {
      fileResult.result = Status.PASSED;
    } else if (isSomeTestClassBroken) {
      fileResult.result = Status.BROKEN;
    } else if (isEveryTestClassSkipped) {
      fileResult.result = Status.SKIPPED;
    } else {
      fileResult.result = Status.BROKEN;
    }
    events.emit(new Event('fileResult', { runner: this, result: fileResult }));
    return fileResult;
  }
  /**
   * Run class which marked `@testable` decorator
   *
   * @template R
   * @param {Ctor<R>} ctor
   * @return {*}  {Promise<ClassResult>}
   * @memberof Runner
   */
  async runClass<R>(ctor: Internal.Ctor<R>): Promise<ClassResult> {

    if (!this._hasInitBefore) {
      this._init();
    }
    this._constructInstanceIfNeeded(ctor);
    const result: ClassResult = {
      ctor,
      name: ctor.name,
      result: Status.PENDING,
      results: [],
      start: Date.now(),
      metadata: {},
    };
    const classTest: ClassTest = {
      ctor,
      hooks: [],
      name: ctor.name,
      tests: [],
      metadata: {},
    };
    log.debug('=> Runner.runClass() %o', classTest);

    const classMetaValue: ClassTest = Reflect.getMetadata(metadata.CLASS_KEY, ctor.prototype);
    const mergedTest: ClassTest = { ...classTest, ...classMetaValue };
    Reflect.defineMetadata(metadata.CLASS_KEY, mergedTest, ctor.prototype)
    events.emit(new Event('runClass', { runner: this, class: mergedTest }));
    const beforeAllResults = await this._runHooks(mergedTest, Kind.beforeAll);
    const results = await Promise.all(mergedTest.tests.map(async test => {
      return await this.runClassTest(ctor, test.name as keyof Internal.Ctor);
    }));
    const afterAllResults = await this._runHooks(mergedTest, Kind.afterAll);
    result.stop = Date.now();
    result.results.push(...[...beforeAllResults, ...results, ...afterAllResults]);

    const isAnyHookFailed =
      afterAllResults.some(r => r.result === 'failed')
      || beforeAllResults.some(r => r.result === 'failed')
      || results.some(r => r.hooks?.some(r => r.result === 'failed'));
    const isAllTestsPassedExcludeSkipped = results.filter(r => r.result !== 'skipped').every(r => r.result === 'passed');

    const isAllTestsSkipped = results.every(r => r.result === 'skipped');
    if (isAllTestsPassedExcludeSkipped) {
      result.result = Status.PASSED;
    } else if (isAnyHookFailed) {
      result.result = Status.BROKEN;
    } else if (isAllTestsSkipped) {
      result.result = Status.SKIPPED;
    } else {
      result.result = Status.BROKEN;
    }
    result.metadata = mergedTest.metadata;
    log.debug('<= Runner.runClass() %o', mergedTest);

    events.emit(new Event('classResult', { runner: this, class: mergedTest, result }));
    return result;
  }

  /**
   * Run class test which marked `@test` with `each` hooks
   *
   * @template Cls
   * @template M
   * @param {Cls} ctor
   * @param {ReturnType<M> extends any ? M : never} method
   * @return {*}  {Promise<TestResult>}
   * @memberof Runner
   */
  async runClassTest<
    Cls extends Internal.Ctor,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    M extends keyof Cls['prototype']
  >(ctor: Cls, method: M): Promise<TestResult> {
    if (!this._hasInitBefore) {
      this._init();
    }
    const instance = this._constructInstanceIfNeeded(ctor) as object;

    const classTest: ClassTest = Reflect.getMetadata(metadata.CLASS_KEY, ctor.prototype);

    const findedTest = classTest.tests.find(t => t.name === method);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    log.debug('<= Runner.runClassTest() %o', findedTest!);
    if (findedTest === undefined) {
      throw new Error(`${ctor.name} is no marked with @test() decorator`);
    }
    const result: TestResult = {
      kind: Kind.test,
      name: findedTest.name,
      start: Date.now(),
      isHook: false,
      result: Status.PENDING,
      metadata: findedTest.metadata,
    };

    events.emit(new Event('classMethod', { runner: this, class: classTest, test: findedTest }));

    const isHaveHooks = !!findedTest.hooks && Array.isArray(findedTest.hooks) && findedTest.hooks.length !== 0;

    if (findedTest.skip) {
      // skip. do not run hooks for selected tests
      const skippedResult: TestResult = {
        ...findedTest,
        result: Status.SKIPPED,
        hooks: [],
      };
      if (isHaveHooks) {
        skippedResult.hooks = [
          ...findedTest.hooks!.filter(h => h.kind === 'beforeEach').map(h => ({ ...h, result: 'skipped', }) as TestResult),
          ...findedTest.hooks!.filter(h => h.kind === 'afterEach').map(h => ({ ...h, result: 'skipped', }) as TestResult)
        ]
      }
      events.emit(new Event('classMethodResult', { runner: this, class: classTest, test: findedTest, result: skippedResult }));
      return skippedResult;
    }

    // have hooks to run
    if (isHaveHooks) {
      const definedBeforeEachHook = findedTest.hooks!
        .filter(h => !h.skip && h.kind === 'beforeEach');

      const beforeEachResults = await Promise.all(definedBeforeEachHook.map(async hook => {
        events.emit(new Event('classEachHook', { runner: this, class: classTest, test: findedTest, hook }));
        const result = await this._runFunction.call(instance, hook.fn, []);
        // beforeEach: append metadata 
        const newMetadata: Hook[] = Reflect.getMetadata(metadata.HOOK_KEY, ctor.prototype);
        const hookTest = newMetadata.find(m => m.name === result.name);
        if (hookTest) {
          result.metadata = hookTest.metadata;
        }
        events.emit(new Event('classEachHookResult', { runner: this, class: classTest, test: findedTest, hook, result }));

        return result;
      }));
      result.hooks?.push(...beforeEachResults)
    }

    const testRunResult = await this._runFunction.call(instance, findedTest.fn, findedTest.data);
    // test: append metadata
    const testMetadata: Test[] = Reflect.getMetadata(metadata.TEST_KEY, ctor.prototype);
    const testWithMetadata = testMetadata.find(m => m.name === findedTest.name);
    if (testWithMetadata) {
      result.metadata = testWithMetadata.metadata;
    }

    result.error = testRunResult.error;
    result.result = testRunResult.result;

    if (result.result === 'failed' && types.isNativeError(result.error)) {
      result.error = result.error.stack;
    } else {
      delete result.error;
    }

    // have hooks to run
    if (isHaveHooks) {
      const definedAfterEachHook = findedTest.hooks!
        .filter(h => !h.skip && h.kind === 'afterEach');
      const afterEachResults = await Promise.all(definedAfterEachHook.map(async hook => {
        events.emit(new Event('classEachHook', { runner: this, class: classTest, test: findedTest, hook }));
        const result = await this._runFunction.call(instance, hook.fn, []);

        // afterEach: append metadata
        const testMetadata: Hook[] = Reflect.getMetadata(metadata.HOOK_KEY, ctor.prototype);
        const testWithMetadata = testMetadata.find(m => m.name === result.name);
        if (testWithMetadata) {
          result.metadata = testWithMetadata.metadata;
        }

        events.emit(new Event('classEachHookResult', { runner: this, class: classTest, test: findedTest, hook, result }));
        return result;
      }));
      result.hooks?.push(...afterEachResults)
    }

    result.stop = Date.now();

    if (isHaveHooks) {
      const isSomeHookFailed = result.hooks!.some(h => h.result === 'failed');
      if (isSomeHookFailed) {
        result.result = Status.BROKEN;
      }
    }
    log.debug('=> Runner.runClassTest() %o', result);

    events.emit(new Event('classMethodResult', { runner: this, class: classTest, test: findedTest, result }));

    return result;
  }

  private async _runHooks(classTest: ClassTest, kind: Test['kind']): Promise<TestResult[]> {

    const isntance = this._constructInstanceIfNeeded(classTest.ctor);
    const classMetaValue: ClassTest = Reflect.getMetadata(metadata.CLASS_KEY, classTest.ctor.prototype);
    const hooks = classMetaValue.hooks.filter(h => h.kind === kind);
    log.debug('=> Runner._runHooks() \n class = %o \n hooks = %o', classMetaValue, hooks);
    const skippedHooks = hooks.filter(h => h.skip);
    const runnedHooks = hooks.filter(h => !h.skip);
    const result: TestResult[] = [];
    skippedHooks.forEach(k => result.push({ result: Status.SKIPPED, name: k.name, isHook: true, kind: k.kind }));
    const hookRunResult: TestResult[] = await Promise.all(runnedHooks.map(async h => {
      events.emit(new Event('classHook', { runner: this, class: classTest, hook: h }));
      const result = await this._runFunction.call(isntance, h.fn!);

      // global hook: append result
      const hookMetadata: Hook[] = Reflect.getMetadata(metadata.HOOK_KEY, classTest.ctor.prototype);
      const findedHook = hookMetadata.find(h => h.name === h.name);
      if (findedHook) {
        result.metadata = findedHook.metadata;
      }

      const hookResult = { ...result, isHook: true, name: h.name, kind: h.kind, stop: Date.now(), };
      log.debug('<= Runner._runHooks() = %o', hookResult);

      events.emit(new Event('classMethodResult', { runner: this, class: classTest, hook: h, result: hookResult }));
      return { ...hookResult, name: h.name };
    }));
    result.push(...hookRunResult);
    return result;
  }
  private _runFunction(this: any, fn: Function, ...args: any[]): Promise<TestResult> {
    const result = { start: Date.now(), result: Status.PENDING, name: '', metadata: undefined, } as TestResult;
    return Promise.race<TestResult>([
      Reflect.apply(fn, this || null, args),
      delay(Runner.timeout),
    ]).then(() => {
      return { ...result, result: Status.PASSED, stop: Date.now() } as TestResult;
    }).catch(error => {
      if (types.isNativeError(error) || typeof error === 'string') {
        console.error(error);
        return { ...result, result: Status.FAILED, error, stop: Date.now() };
      }
      return { ...result, result: Status.FAILED, error: new Error('unknown error occured'), stop: Date.now(), };
    });
  }
  private _constructInstanceIfNeeded<R>(ctor: Internal.Ctor<R>): R {
    const metaInstance = Reflect.getMetadata(metadata.INSTANCE_KEY, ctor.prototype);
    const classTest: ClassTest = Reflect.getMetadata(metadata.CLASS_KEY, ctor.prototype)
    if (!metaInstance) {
      const instance = Reflect.construct(ctor, []);
      events.emit(new Event('classConstructor', { runner: this, class: classTest, instance }));
      return instance;
    }
    return metaInstance;
  }
}

function isFileTest(testLike: unknown): testLike is FileTest {
  if (typeof testLike === 'object' && testLike && 'path' in testLike && 'classes' in testLike) {
    return true;
  }
  return false;
}
