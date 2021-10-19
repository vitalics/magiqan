export type Ctor<R = unknown, A extends unknown[] = []> = new (...args: A) => R;
export type Fn<R = unknown, A extends unknown[] = [], This = unknown> = (this: This, ...args: A) => R;

/**
 * Ask TS to re-check that `A1` extends `A2`.
 * And if it fails, `A2` will be enforced anyway.
 * Can also be used to add constraints on parameters.
 * @param A1 to check against
 * @param A2 to cast to
 * @returns `A1 | A2`
 * @see {@link https://github.com/millsp/ts-toolbelt/blob/master/sources/Any/Cast.ts }
 * @example
 * ```ts
 * import type {Cast} from 'utils/types'
 *
 * type test0 = Cast<'42', string> // '42'
 * type test1 = Cast<'42', number> // number
 * ```
 */
export type Cast<A1, A2> =
  A1 extends A2
  ? A1
  : A2;
