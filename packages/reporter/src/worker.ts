import events from '@magiqan/events';
import type { FileResult } from '@magiqan/types';
import { Reporter } from './base';

export class WorkerReporter extends Reporter {

  constructor(private readonly reporter: Reporter) {
    super();

    // events takes from worker is not correctly applies to results. 
    // better to unsubscribe here and use addResults method instead
    events.unsubscribe('fileResult', (runner, result) => {
      super.onFileResult(result, runner);
    })
  }
  generate(outFile: string): Promise<void> {
    return this.reporter.generate(outFile)
  }

  /**
   * Add raw results after all data collected
   * 
   * NOTE: this operation should be done after getting results
   *
   * @param {FileResult[]} results
   * @memberof WorkerReporter
   */
  addResults(results: FileResult[]) {
    this._results = results;
    this.reporter._results = results;
  }
}
