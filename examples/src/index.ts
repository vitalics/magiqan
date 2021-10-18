import { JSONReporter } from '@magiqan/reporter';
import { Runner } from '@magiqan/runner';

import { SomeTest } from './testFile';

export async function run() {
  const cwd = __dirname;
  const runner = new Runner(cwd);
  const reporter = new JSONReporter(`${cwd}/out.json`);
  // const dot = new DotReporter();
  await runner.runClassTest(SomeTest, 'someTest');
  // runner.addFile('./testFile.ts');
  // // runner.addFile('./testFile.ts');
  // // experimantal workers
  // // const result = await runner.runAsync(); // duration 4~5 
  // // const wr = new WorkerReporter(new JSONReporter());
  // // wr.addResults(result);
  // // await wr.generate('./worker-output.json');

  await runner.run(); // duration: 2~3

  reporter.generate();
  // dot.generate();
  // reporter.destroy();
  // await pipelineAsync(JSON.stringify(result!), reporter);

  // reporter.pipe(destination)
  // const results = runner.run();
  // console.log('file results', results);

  // await reporter.generate('./examples/out.json');

}

run();
