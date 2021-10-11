import { Event } from '@magiqan/events';

type LogPayload = { namespace: string, message: string, args?: any[] }

export class LogEvent extends Event<LogPayload> {
  constructor(
    readonly payload: LogPayload
  ) {
    super('log', payload);
  }
}