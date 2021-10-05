import type { Events as EventType } from '@magiqan/types';
import { Events } from './events';

const events = new Events();

export type EventNames = EventType.Names;
export type EventMap = EventType.Map;
export { Events, events };
export default events;
