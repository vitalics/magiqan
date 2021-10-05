import { Runner } from '@magiqan/runner';
import { JSONReporter } from '@magiqan/reporter';


export async function run() {
  const runner = new Runner(__dirname);
  const reporter = new JSONReporter();

  runner.addFile('./testFile.ts');
  await runner.run();

  await reporter.generate('./examples/out.json');
}

run();