import { EventEmitter } from 'events';

import type { Internal, Lifecycle, Events as EventType } from '@magiqan/types';

export class Events<M extends Record<string, unknown[]> = EventType.Map> implements Lifecycle.OnDestroy {
  #emitter = new EventEmitter();
  subscribe<Name extends keyof M>(name: Name, listener: Internal.Fn<void, M[Name]>) {
    // @ts-ignore
    return this.#emitter.on(name, listener);
  }
  emit<Name extends keyof M>(name: Name, ...args: M[Name]) {
    // @ts-ignore
    return this.#emitter.emit(name, ...args);
  }
  unsubscribe<Name extends keyof M>(name: Name, listener: Internal.Fn<void, M[Name]>) {
    // @ts-ignore
    return this.#emitter.removeListener(name, listener);
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
