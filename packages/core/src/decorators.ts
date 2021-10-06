import 'reflect-metadata';

import { Kind } from '@magiqan/constants';

import { defineTest, defineClassTest, defineInstance, defineHook } from '@magiqan/runtime';

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
    defineClassTest(target, options?.skip);

    return new Proxy(target, {
      construct(target, argArray, newTarget) {
        const instance = Reflect.construct(target, argArray, newTarget);
        defineInstance(instance, target.prototype);
        return instance;
      },
    });
  }
}

export function test(options?: MethodSettings): MethodDecorator {
  return function (target, key, descriptor: TypedPropertyDescriptor<any>) {
    const fn = descriptor.value as Function;

    defineTest(target, {
      kind: Kind.test,
      fn: descriptor.value,
      isHook: false,
      skip: options?.skip,
      hooks: [],
      data: [],
      name: key,
    });
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

    defineHook(target, {
      kind: Kind.beforeAll,
      fn: descriptor.value,
      name: key,
      isHook: true,
      skip: options?.skip,
    });
    descriptor.value = function (...args: any[]) {
      const result = fn.apply(this, args);
      return result;
    }
    return descriptor;
  }
}


export function beforeEach(options?: HookSettings): MethodDecorator {
  return function (target, key, descriptor: TypedPropertyDescriptor<any>) {
    defineHook(target, {
      kind: Kind.beforeEach,
      fn: descriptor.value,
      skip: options?.skip,
      name: key,
      isHook: true,
    });
  }
}
export function afterEach(options?: HookSettings): MethodDecorator {
  return function (target, key, descriptor: TypedPropertyDescriptor<any>) {
    defineHook(target, {
      kind: Kind.afterEach,
      fn: descriptor.value,
      name: key,
      isHook: true,
      skip: options?.skip,
    });
  }
}
export function afterAll(options?: HookSettings): MethodDecorator {
  return function (target, key, descriptor: TypedPropertyDescriptor<any>) {
    defineHook(target, {
      kind: Kind.afterAll,
      fn: descriptor.value,
      name: key,
      isHook: true,
      skip: options?.skip,
    });
  }
}
