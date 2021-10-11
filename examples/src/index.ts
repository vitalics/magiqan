import { Runner } from '@magiqan/runner';
import { JSONReporter } from '@magiqan/reporter';

export async function run() {
  const runner = new Runner(__dirname);
  const reporter = new JSONReporter('./out.json');
  runner.addFile('./testFile.ts');
  // runner.addFile('./testFile.ts');
  // runner.addFile('./testFile.ts');
  // experimantal workers
  // const result = await runner.runAsync(); // duration 4~5 
  // const wr = new WorkerReporter(new JSONReporter());
  // wr.addResults(result);
  // await wr.generate('./worker-output.json');

  await runner.run(); // duration: 2~3

  reporter.generate();
  // reporter.destroy();
  // await pipelineAsync(JSON.stringify(result!), reporter);

  // reporter.pipe(destination)
  // const results = runner.run();
  // console.log('file results', results);

  // await reporter.generate('./examples/out.json');
}

run();