import 'reflect-metadata';

import { metadata } from '@magiqan/constants';
import type { ClassTest, Hook, Internal, Test } from '@magiqan/types';

export function defineTest(target: Internal.Fn | Object, test: Test) {
  const meta: Test[] = Reflect.getMetadata(metadata.TEST_KEY, target) || [];
  const newMeta: Test[] = [...meta, test];
  Reflect.defineMetadata(metadata.TEST_KEY, newMeta, target);
}

export function defineHook(target: Internal.Fn | Object, test: Hook) {
  const meta: Hook[] = Reflect.getMetadata(metadata.HOOK_KEY, target) || [];
  const newMeta: Hook[] = [...meta, test];
  Reflect.defineMetadata(metadata.HOOK_KEY, newMeta, target);
}

export function defineClassTest(target: Internal.Fn | Function, skip?: boolean) {
  const hooks: Test[] = Reflect.getMetadata(metadata.HOOK_KEY, target.prototype) || [];
  const metaTests: Test[] = Reflect.getMetadata(metadata.TEST_KEY, target.prototype) || [];
  const beforeEachHooks = hooks.filter(h => h.kind === 'beforeEach');
  const afterEachHooks = hooks.filter(h => h.kind === 'afterEach');

  const tests = metaTests.map(t => ({ ...t, hooks: [...beforeEachHooks, ...afterEachHooks] }))

  const cls: ClassTest = {
    name: target.name,
    skip: skip,
    hooks,
    tests,
    ctor: target as any,
  }
  Reflect.defineMetadata(metadata.CLASS_KEY, cls, target.prototype);
}
