import { writeFileSync } from 'fs';
import { Session } from 'inspector';


export abstract class Profiler {
  protected readonly session: Session = new Session();
  constructor() {
    this.session.connect();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.session.post('Profiler.enable', () => { });
  }
  abstract start(): void | Promise<void>;
  abstract stop(): void | Promise<void>;
}

// https://nodejs.org/docs/latest-v12.x/api/inspector.html#inspector_cpu_profiler
export class CPUProfiler extends Profiler {

  start() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.session.post('Profiler.start', () => { });
  }
  stop() {
    this.session.post('Profiler.stop', (err, { profile }) => {
      // Write profile to disk, upload, etc.
      if (!err) {
        // TODO: move to a fs.createWriteStream(); for better performance
        // now this operation blocks IO operations
        writeFileSync('./profile.cpuprofile', JSON.stringify(profile));
      }
    });
  }
}
