import { createWriteStream, WriteStream } from 'fs';
import { resolve } from 'path';

import type { RunnerLike } from '@magiqan/types';

import { Reporter } from './base';

export abstract class FileReporter extends Reporter {
  protected _stream: WriteStream | null = null;
  protected file: string = '';
  constructor(readonly filePath: string) {
    super();
  }
  onRunnerInit(_runner: RunnerLike, cwd: string) {
    this.file = resolve(cwd, this.filePath);
    this._stream = createWriteStream(this.file, { flags: 'w+' });
  }
  async generate(data?: any) {
    this._stream?.end(data);
  }
}
