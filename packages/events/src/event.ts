import type { Events } from '@magiqan/types';

export class Event<
  N extends string | keyof Events.Map = keyof Events.Map,
  T extends Events.Map[keyof Events.Map] | Record<string, unknown> = Record<string, unknown>
  > implements Events.Event<N, T> {
  readonly timestamp = Date.now();
  constructor(
    public readonly name: N,
    public readonly payload: T,
  ) { }
}
