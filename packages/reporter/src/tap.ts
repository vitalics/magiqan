import { Reporter } from '.';

export class TapReporter extends Reporter {
  generate(_outFile: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
