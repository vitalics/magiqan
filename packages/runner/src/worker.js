const { workerData, parentPort } = require('worker_threads');

const { Runner } = require('./runner');

const runner = new Runner();

// note: unanable to post message Promise object
(async function () {
  const result = await runner.runFile(workerData);
  if (!result) {
    returns(undefined);
  }
  // remove references like isntance, ctor
  const tranferable = { ...result, results: result.results.map(({ ctor, instance, ...rest }) => ({ ...rest })) };
  // emit results
  returns(tranferable);
})();

function returns(value, code = 1) {
  parentPort.postMessage(tranferable);
  return process.exit(code);
};
