export type Ctor<R = unknown, A extends unknown[] = []> = new (...args: A) => R;
export type Fn<R = unknown, A extends unknown[] = [], This = unknown> = (this: This, ...args: A) => R;