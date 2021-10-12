#!/usr/bin/env node
import yargs = require('yargs/yargs');
import { hideBin } from 'yargs/helpers';
import { Runner } from '@magiqan/runner';
import { JSONReporter } from '@magiqan/reporter';

const runner = new Runner(process.cwd());

yargs(hideBin(process.argv))
  .command('run <grep>', 'run tests',
    yargs => yargs.positional('grep', {describe: 'file or regex pattern'}).option('output', {
      alias: 'o',
      default: 'out.json'
    }),
    async args => {
      const reporter = new JSONReporter(args.output);

      await runner.addGlob(args.grep as string ?? 'tests/**/*.test.ts');

      await runner.run();
      await reporter.generate();
    }).option('reporter', {
      type: 'string',
      default: 'JSONReporter'
    })
  .parse()
