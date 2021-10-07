import { Runner } from '@magiqan/runner';
import { performance, PerformanceObserver } from 'perf_hooks'
import { JSONReporter, WorkerReporter } from '@magiqan/reporter';

// import { SomeTest } from './testFile';

const obs = new PerformanceObserver((list) => {
  const entries = list.getEntriesByType('function');
  entries.forEach((entry) => {
    console.log(`${entry.name} takes`, entry.duration)
  });
  obs.disconnect();
});
obs.observe({ entryTypes: ['function'] });

export async function run() {
  const runner = new Runner(__dirname);
  const timerifyWorker = performance.timerify(runner.runAsync)
  // const reporter = new JSONReporter();
  runner.addFile('./testFile.ts');
  runner.addFile('./testFile.ts');
  runner.addFile('./testFile.ts');
  // experimantal workers
  const result = await timerifyWorker.call(runner); // duration 4~5 
  const wr = new WorkerReporter(new JSONReporter());
  wr.addResults(result);
  await wr.generate('./worker-output.json');

  // await timerifyRun.call(runner); // duration: 2~3
  // const results = runner.run();
  // console.log('file results', results);

  // await reporter.generate('./examples/out.json');
}

run();