import type { Events } from '@magiqan/events';

export class EventError extends Error {
  _event?: Events;
  constructor(message?: string) {
    super(message)
  }
  static from(event: Events) {
    const error = new EventError();
    error._event = event;
    return error;
  }
}

export class EmitError extends EventError {
  constructor(eventName: string) {
    super(`Event is not defined for name ${eventName}`);
  }
}

export class SubscribeError extends EventError {
  constructor(eventName: string) {
    super(`unanable to subscribe event with name ${eventName}`);
  }
}

export default {
  EventEmitError: EmitError,
  EventError,
  EventSubscribeError: SubscribeError,
};