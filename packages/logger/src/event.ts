import { Event } from '@magiqan/events';
import type { Logger } from '@magiqan/types';

type LogPayload = { namespace: string, timestamp: Date, level: Logger.LogLevel, logger: Logger.Logger, message: string, args?: unknown[] }

export class LogEvent extends Event<'log', LogPayload> {
  constructor(
    readonly payload: LogPayload
  ) {
    super('log', payload);
  }
}
