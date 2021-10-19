export type Logger = {
  /**
   * Logs input message as information layer
   *
   * @template S
   * @template A
   * @param {S} message
   * @param {...A} args
   */
  info<S extends string, A extends ParsePrintFormat<S>>(message: S, ...args: A): void;
  /**
   * Logs input message
   *
   * @template S
   * @template A
   * @param {S} message
   * @param {...A} args
   */
  log<S extends string, A extends ParsePrintFormat<S>>(message: S, ...args: A): void;
  /**
   * Logs input message as debug layer
   *
   * @template S
   * @template A
   * @param {S} message
   * @param {...A} args
   */
  debug<S extends string, A extends ParsePrintFormat<S>>(message: S, ...args: A): void;
  /**
   * Logs input message as error
   *
   * @template S
   * @template A
   * @param {S} message
   * @param {...A} args
   */
  error<S extends string, A extends ParsePrintFormat<S>>(message: S | Error, ...args: A): void;
  trace<S extends string, A extends ParsePrintFormat<S>>(message: S, ...args: A): void;
  warn<S extends string, A extends ParsePrintFormat<S>>(message: S, ...args: A): void;
};

export type LogLevel = 'INFO' | 'DEBUG' | 'ERROR' | 'TRACE' | 'WARN' | 'SILENT';

// Formatter types. Do not modify!

type ControlsMap = {
  o: Record<string, unknown> | readonly unknown[];
  O: Record<string, unknown> | readonly unknown[];
  d: number; // decimal
  i: number; // int
  f: number; // float
  s: string;
}

/**
 * Inspired from type challange
 * @link https://github.com/type-challenges/type-challenges/blob/master/questions/147-hard-c-printf-parser/README.md
 * @link https://github.com/type-challenges/type-challenges/issues/1443
 */
type ParsePrintFormat<S extends string, A extends ControlsMap[keyof ControlsMap][] = []> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  S extends `${infer _}%${infer Control}${infer Last}` ?
  Control extends keyof ControlsMap ?
  ParsePrintFormat<Last, [...A, ControlsMap[Control]]> :
  ParsePrintFormat<Last, A>
  : A;
