import { Event } from '@magiqan/events';

type LogPayload = { namespace: string, timestamp: Date, message: string, args?: any[] }

export class LogEvent extends Event<LogPayload> {
  constructor(
    readonly payload: LogPayload
  ) {
    super('log', payload);
  }
}
