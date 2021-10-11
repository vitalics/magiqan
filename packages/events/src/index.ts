import type { Events as EventType } from '@magiqan/types';
import { Events } from './events';
import { Event } from './event';

const events = new Events();

export type EventNames = EventType.Names;
export type EventMap = EventType.Map;
export { Events, events, Event };
export default events;
