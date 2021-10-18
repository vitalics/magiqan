import { promisify } from 'util';
import { setTimeout } from 'timers';

import { TimeoutError } from '@magiqan/errors';

const delay = promisify(setTimeout);

export default async function (ms: number, signal?: AbortSignal) {
  return delay(ms, undefined, { signal })
    .then(
      () =>
        Promise.reject(new TimeoutError(ms))
    );
}
