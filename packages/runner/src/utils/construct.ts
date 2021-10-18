import 'reflect-metadata';
import { metadata } from '@magiqan/constants';
import { Event, events } from '@magiqan/events';
import type { Internal, ClassTest, RunnerLike } from '@magiqan/types';

export function constructInstanceIfNeeded<R>(this: RunnerLike, ctor: Internal.Ctor<R>): R {
  const metaInstance = Reflect.getMetadata(metadata.INSTANCE_KEY, ctor.prototype);
  const classTest: ClassTest = Reflect.getMetadata(metadata.CLASS_KEY, ctor.prototype)
  if (!metaInstance) {
    const instance = Reflect.construct(ctor, []);
    events.emit(new Event('classConstructor', { runner: this, class: classTest, instance }));
    return instance;
  }
  return metaInstance;
}
