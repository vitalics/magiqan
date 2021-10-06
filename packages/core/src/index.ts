import 'reflect-metadata';

import { metadata, Kind } from '@magiqan/constants';

import type { ClassTest, Test } from '@magiqan/types';

type Settings = {
  parallel?: boolean;
  skip?: boolean;
  retries?: number;
};
type ClassSettings = Omit<Settings, 'parallel'>
type MethodSettings = Settings;
type HookSettings = Omit<Settings, 'parallel'>;

export function testable(options?: ClassSettings): ClassDecorator {
  // TODO: enable parallel mode
  return function (target) {
    const hooks: Test[] = Reflect.getMetadata(metadata.HOOK_KEY, target.prototype) || [];
    const metaTests: Test[] = Reflect.getMetadata(metadata.TEST_KEY, target.prototype) || [];
    const beforeEachHooks = hooks.filter(h => h.kind === 'beforeEach');
    const afterEachHooks = hooks.filter(h => h.kind === 'afterEach');

    const tests = metaTests.map(t => ({ ...t, hooks: [...beforeEachHooks, ...afterEachHooks] }))

    const cls: ClassTest = {
      name: target.name,
      skip: options?.skip,
      hooks,
      tests,
      ctor: target as any,
    }
    Reflect.defineMetadata(metadata.CLASS_KEY, cls, target.prototype);
    return new Proxy(target, {
      construct(target, argArray, newTarget) {
        const instance = Reflect.construct(target, argArray, newTarget);
        Reflect.defineMetadata(metadata.INSTANCE_KEY, instance, target.prototype);
        return instance;
      }
    });
  }
}

export function test(options?: MethodSettings): MethodDecorator {
  return function (target, key, descriptor: TypedPropertyDescriptor<any>) {
    const fn = descriptor.value as Function;

    let meta: Test[] = Reflect.getMetadata(metadata.TEST_KEY, target) || [];
    const newMeta: Test[] = [...meta, {
      kind: Kind.test,
      fn: descriptor.value,
      isHook: false,
      skip: options?.skip,
      hooks: [],
      data: [],
      name: key,
    }];
    Reflect.defineMetadata(metadata.TEST_KEY, newMeta, target);
    descriptor.value = function (...args: any[]) {
      const result = fn.apply(this, args);
      return result;
    }
    return descriptor;

  }
}

export function beforeAll(options?: HookSettings): MethodDecorator {
  return function (target, key, descriptor: TypedPropertyDescriptor<any>) {
    const fn = descriptor.value as Function;

    let meta: Test[] = Reflect.getMetadata(metadata.HOOK_KEY, target) || [];
    const newMeta: Test[] = [...meta, {
      kind: Kind.beforeAll,
      fn: descriptor.value,
      name: key,
      isHook: true,
      skip: options?.skip,
    }];
    Reflect.defineMetadata(metadata.HOOK_KEY, newMeta, target);
    descriptor.value = function (...args: any[]) {
      const result = fn.apply(this, args);
      return result;
    }
    return descriptor;
  }
}


export function beforeEach(options?: HookSettings): MethodDecorator {
  return function (target, key, descriptor: TypedPropertyDescriptor<any>) {
    const fn = descriptor.value as Function;

    let meta: Test[] = Reflect.getMetadata(metadata.HOOK_KEY, target) || [];
    const newMeta: Test[] = [...meta, {
      kind: Kind.beforeEach,
      fn: descriptor.value,
      skip: options?.skip,
      name: key,
      isHook: true,
    }];
    Reflect.defineMetadata(metadata.HOOK_KEY, newMeta, target);
    descriptor.value = function (...args: any[]) {
      const result = fn.apply(this, args);
      return result;
    }
    return descriptor;

  }
}
export function afterEach(options?: HookSettings): MethodDecorator {
  return function (target, key, descriptor: TypedPropertyDescriptor<any>) {
    const fn = descriptor.value as Function;

    let meta: Test[] = Reflect.getMetadata(metadata.HOOK_KEY, target) || [];
    const newMeta: Test[] = [...meta, {
      kind: Kind.afterEach,
      fn: descriptor.value,
      name: key,
      isHook: true,
      skip: options?.skip,
    }];
    Reflect.defineMetadata(metadata.HOOK_KEY, newMeta, target);
    descriptor.value = function (...args: any[]) {
      const result = fn.apply(this, args);
      return result;
    }
    return descriptor;

  }
}
export function afterAll(options?: HookSettings): MethodDecorator {
  return function (target, key, descriptor: TypedPropertyDescriptor<any>) {
    const fn = descriptor.value as Function;

    let meta: Test[] = Reflect.getMetadata(metadata.HOOK_KEY, target) || [];
    const newMeta: Test[] = [...meta, {
      kind: Kind.afterAll,
      fn: descriptor.value,
      name: key,
      isHook: true,
      skip: options?.skip,
    }];
    Reflect.defineMetadata(metadata.HOOK_KEY, newMeta, target);
    descriptor.value = function (...args: any[]) {
      const result = fn.apply(this, args);
      return result;
    }
    return descriptor;
  }
}
