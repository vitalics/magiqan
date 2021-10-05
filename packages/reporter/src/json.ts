import { promisify } from 'util';
import { writeFile } from 'fs';

const writeFileAsync = promisify(writeFile);

import { Reporter } from './base';

export class JSONReporter extends Reporter {

  async generate(file: string): Promise<void> {
    return writeFileAsync(file, JSON.stringify(this._results, null, 2));
  }
}
