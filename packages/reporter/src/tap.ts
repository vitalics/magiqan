import { Reporter } from '.';

export class TapReporter extends Reporter {
  generate(outFile: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
