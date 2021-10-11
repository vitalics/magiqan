import type { Events } from '@magiqan/types';

export class Event<T extends Record<string, unknown>> implements Events.Event<string, T> {
  constructor(
    public readonly name: string,
    public readonly payload: T,
  ) { }
}
