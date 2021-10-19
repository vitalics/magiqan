/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'reflect-metadata';
import { EventEmitter } from 'events';
import { SHARE_ENV, Worker } from 'worker_threads';
import { resolve } from 'path';
import { promisify } from 'util';
import { setTimeout } from 'timers';

// eslint-disable-next-line import/no-named-as-default
import glob from 'glob';
import type {
  TestResult,
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
import type { Ctor, Fn } from '@magiqan/types/src/_internal';

import { getClassDecision } from './utils/decision';
import { constructInstanceIfNeeded, runClassMethodWithHooks, runHooks } from './utils';

const globAsync = promisify(glob);
const defaultTimeout = 1000;
const timeout = promisify(setTimeout);

const log = logger('@magiqan/runner');

export class Runner extends EventEmitter implements RunnerLike {
  private static _override_runner: RunnerLike | null = null;
  static timeout = defaultTimeout;
  constructor(readonly cwd = process.cwd()) {
    super();
  }
  private _allPaths: string[] = [];
  private _hasInitBefore = false;
  private _shouldFireEndEvent = false;

  protected _currentFile?: FileTest;
  protected _currentClass?: ClassTest;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  on(eventName: 'runnerInit', listener: Fn<void, [{ runner: RunnerLike, cwd: string }]>): this;
  on(eventName: 'runnerRun', listener: Fn<void, [{ runner: RunnerLike, files: FileTest[] }]>): this;
  on(eventName: 'runnerRunEnd', listener: Fn<void, [{ runner: RunnerLike, files: FileTest[], results: FileResult[] }]>): this;
  on(eventName: string, listener: Fn<void, [Record<string, unknown>]>): this;
  on(eventName: string, listener: Fn<void, unknown[]>): this {
    return super.on(eventName, listener);
  }
  emit(eventName: 'runnerInit', payload: { runner: RunnerLike, cwd: string }): boolean;
  emit(eventName: 'runnerRun', payload: { runner: RunnerLike, files: FileTest[] }): boolean;
  emit(eventName: 'runnerRunEnd', payload: { runner: RunnerLike, files: FileTest[], results: FileResult[] }): boolean;
  emit(eventName: string, payload: Record<string, unknown>): boolean;
  emit(eventName: string, payload: Record<string, unknown>): boolean {
    const isEventNamesMatches = eventName === 'runnerInit' || eventName === 'runnerRun' || eventName === 'runnerRunEnd'
    if (!isEventNamesMatches) {
      throw new Error(`Runner.emit() only accept 'runnerInit', 'runnerRun' and 'runnerRunEnd' event`);
    }
    return events.emit(new Event(eventName, payload));
  }

  private _init(): void {
    this._hasInitBefore = true;
    log.debug('Runner._init()');
    this.emit('runnerInit', { runner: this, cwd: this.cwd });
  }

  static override<C extends Ctor<RunnerLike, A>, A extends any[] = []>(runnerCtor: C, ...args: A) {
    this._override_runner = Reflect.construct(runnerCtor, args);
    return this;
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
    globAsync(globPattern).then(
      paths => {
        paths.forEach((f: string) => this._appendFile(f));
      }
    );
  }
  addFiles(filePaths: string[]) {
    filePaths.forEach(this._appendFile)
  }

  private _appendFile(file: string) {
    const resolved = resolve(this.cwd, file)
    log.debug(`append file ${resolved}`);
    this._allPaths.push(resolved);
  }

  /**
   * [Experimantal] run file in worker
   * 
   * @private
   * @internal
   * @return {*} 
   * @memberof Runner
   */
  async runAsync() {
    log.warn('Runner.runAsync() is experimantal, use Runner.run() method instead');
    if (!this._hasInitBefore) {
      this._init();
      this._shouldFireEndEvent = true;
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
    if (Runner._override_runner) {
      return Runner._override_runner.run();
    }
    log.debug('Runner.run() %o', this._allPaths);
    if (!this._hasInitBefore) {
      this._init();
      this._shouldFireEndEvent = true;
    }
    if (this._allPaths.length === 0) {
      return [];
    }

    // map paths to file test
    const files = this._allPaths.map(path => {
      return { classes: [], path, } as FileTest;
    });

    const coldResults: FileResult[] = files.map(f => ({ path: f.path, start: Date.now(), result: Status.PENDING, results: [] }));
    this.emit('runnerRun', { runner: this, files: coldResults });
    const results = await Promise.all(
      files.map(async f => {
        this._currentFile = f;
        const coldResult: FileResult = coldResults.find(r => r.path === f.path)!;
        const result = { ...coldResult, ...await this.runFile(f) };
        this._currentFile = undefined;
        return result;
      }));
    this._fireRunnerEndEvent(files, results);
    return results;
  }

  async runFile(filePathOrTest: string | FileTest): Promise<FileResult | undefined> {
    if (Runner._override_runner) {
      return Runner._override_runner.runFile(filePathOrTest);
    }


    log.debug(`Runner.runFile(${filePathOrTest})`);
    if (!this._hasInitBefore) {
      this._init();
      this._shouldFireEndEvent = true;
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
      const classResult = await this.runClass(cls.ctor!);
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
    this._fireRunnerEndEvent([fileTest], [fileResult]);
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
    if (Runner._override_runner) {
      return Runner._override_runner.runClass(ctor);
    }
    if (!this._hasInitBefore) {
      this._init();
      this._shouldFireEndEvent = true;
    }
    constructInstanceIfNeeded.call(this, ctor);
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
    const beforeAllResults = await runHooks.call(this, mergedTest, Kind.beforeAll);
    const results = await Promise.all(mergedTest.tests.map(async test => {
      return await this.runClassTest(ctor, test.name as keyof Internal.Ctor);
    }));
    const afterAllResults = await runHooks.call(this, mergedTest, Kind.afterAll);
    result.stop = Date.now();
    result.results.push(...[...beforeAllResults, ...results, ...afterAllResults]);

    result.result = getClassDecision(result);
    result.metadata = mergedTest.metadata;
    log.debug('<= Runner.runClass() %o', mergedTest);

    events.emit(new Event('classResult', { runner: this, class: mergedTest, result }));
    this._fireRunnerEndEvent([{ path: `VM:${process.pid}`, classes: [] }], [{ path: `VM:${process.pid}`, result: result.result, results: [result] }]);
    return result;
  }

  /**
   * Run class test which marked `@test` with `each` and `all` hooks
   *
   * @template Cls
   * @template M
   * @param {Cls} ctor
   * @param {ReturnType<M> extends any ? M : never} method
   * @return {*}  {Promise<TestResult>}
   * @memberof Runner
   */
  async runClassTest<Cls extends Internal.Ctor, M extends keyof Cls>(ctor: Cls, method: M): Promise<TestResult> {
    if (Runner._override_runner) {
      return Runner._override_runner.runClassTest(ctor, String(method));
    }

    const classResult: ClassResult = {
      name: ctor.name,
      result: Status.PENDING,
      results: [],
      ctor,
      start: Date.now(),
    };

    const fileResult: FileResult = {
      path: `VM:${process.pid}`,
      result: Status.PENDING,
      results: [classResult],
      isRetried: false,
      start: Date.now(),
    }

    const fileTest: FileTest = {
      path: `VM:${process.pid}`,
      classes: [{
        hooks: [],
        name: ctor.name,
        tests: [],
        ctor,
      }],
    };

    let testResult: TestResult | null = null;

    if (!this._hasInitBefore) {
      this._init();
      this._shouldFireEndEvent = true;
      // if init has never been requested - run method with global hooks
      testResult = await runClassMethodWithHooks.call(this, ctor, String(method), true);
    }

    if (!testResult) {
      // run method without global hooks
      testResult = await runClassMethodWithHooks.call(this, ctor, String(method), false);
    }
    // file test
    fileTest.classes[0].tests.push({
      kind: Kind.test,
      isHook: false,
      name: String(method),
      metadata: testResult.metadata,
      // remove global hooks from test result
      hooks: testResult.hooks?.filter(h => h.kind === Kind.beforeEach || h.kind === Kind.afterEach).map(h => ({ isHook: true, kind: h.kind, name: h.name } as Hook)),
    });
    // add global hooks to class result
    const classHooks = testResult.hooks?.filter(h => h.kind === Kind.beforeAll || h.kind === Kind.afterAll);
    if (classHooks && Array.isArray(classHooks)) {
      classResult.results.push(...classHooks);
    }
    testResult.hooks = testResult.hooks?.filter(h => h.kind === Kind.beforeEach || h.kind === Kind.afterEach);

    // class result
    classResult.stop = Date.now();
    classResult.results.push(testResult);
    classResult.result = getClassDecision(classResult);

    // file result
    fileResult.stop = Date.now();
    fileResult.result = classResult.result;
    fileResult.results[0] = classResult;
    this._fireRunnerEndEvent([fileTest], [fileResult]);

    return testResult;
  }
  private _fireRunnerEndEvent(files: FileTest[], results: FileResult[]) {
    if (this._shouldFireEndEvent) {
      this.emit('runnerRunEnd', { runner: this, files, results });
    }
    this._shouldFireEndEvent = false;
  }
}

function isFileTest(testLike: unknown): testLike is FileTest {
  if (typeof testLike === 'object' && testLike && 'path' in testLike && 'classes' in testLike) {
    return true;
  }
  return false;
}
