import { promisify } from 'util';
import { writeFile } from 'fs';

const writeFileAsync = promisify(writeFile);

import { Reporter } from './base';

export class HTMLReporter extends Reporter {
  async generate(file: string): Promise<void> {
    return writeFileAsync(file, 'some data');
  }
}
