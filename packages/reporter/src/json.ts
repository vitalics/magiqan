import type { FileResult, RunnerLike, } from '@magiqan/types';

import { FileReporter } from './file';

export class JSONReporter extends FileReporter {
  _results: FileResult[] = [];
  constructor(readonly filePath: string) {
    super(filePath);
  }

  onRunnerInit(_runner: RunnerLike, cwd: string) {
    super.onRunnerInit(_runner, cwd);
    this._stream?.write('[');
  }

  onRunnerRunEnd(results: FileResult[]) {
    const stringifyed = JSON.stringify(results, null, 2);
    this._stream?.write(stringifyed);
  }
  generate() {
    return super.generate(']');
  }
}
