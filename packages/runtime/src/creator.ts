import type { ClassTest, Hook, Internal, Test } from '@magiqan/types';

type Fn<T = unknown> = Internal.Fn<void | Promise<void>, [], T>;


export function createTest(name: string, body: Fn): Test {
  throw new Error('Not implemented');
};

export function createClass(name: string, constructor: Fn, tests: Test[] = [], hooks: Hook[] = []): ClassTest {
  throw new Error('Not implemented');
}

export function createGlobalHook(cls: ClassTest, hook: Hook) {
  throw new Error('Not implemented');

}
export function createTestHook(name: string, kind: 'before' | 'after', body: Fn) {
  throw new Error('Not implemented');
}
