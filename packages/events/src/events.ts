import { EventEmitter } from 'events';

import type { Internal, Lifecycle, Events as EventType } from '@magiqan/types';

export class Events<M extends Record<string, EventType.Event<string, {}>> = EventType.Map> implements Lifecycle.OnDestroy {
  #emitter = new EventEmitter();
  subscribe<Name extends keyof M, E extends EventType.Event<string, {}> = M[Name]>(name: Name, listener: Internal.Fn<void, [event: E['payload']]>) {
    return this.#emitter.on(String(name), listener);
  }
  emit<T>(event: EventType.Event<string, T>) {
    return this.#emitter.emit(event.name, event.payload);
  }
  unsubscribe<Name extends keyof M>(name: Name, listener: Internal.Fn<void, [event: M[Name]]>) {
    return this.#emitter.removeListener(String(name), listener);
  }
  destroy(): void | Promise<void> {
    this.#emitter.removeAllListeners();
  }

  getCount(event: keyof M & string): number {
    return this.#emitter.listenerCount(event);
  }

  get names() {
    return this.#emitter.eventNames() as string[];
  }
}
