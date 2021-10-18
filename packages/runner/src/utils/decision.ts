import { Kind, Status } from '@magiqan/constants';
import type { ClassResult } from '@magiqan/types';

/**
 * Get a decision for a class result.
 *
 * @export
 * @param {ClassResult} classTest
 * @return {*}  {Status}
 */
export function getClassDecision(classTest: ClassResult): Status {
  const afterAllResults = classTest.results?.filter(h => h.kind === Kind.afterAll);
  const beforeAllResults = classTest.results?.filter(h => h.kind === Kind.beforeAll);
  const results = classTest.results?.filter(h => h.kind === Kind.test);

  const isAnyHookFailed =
    afterAllResults.some(r => r.result === 'failed')
    || beforeAllResults.some(r => r.result === 'failed')
    || results.some(r => r.hooks?.some(r => r.result === 'failed'));

  const isAllTestsPassedExcludeSkipped = results.filter(r => r.result !== 'skipped').every(r => r.result === 'passed');

  const isAllTestsSkipped = results.every(r => r.result === 'skipped');

  if (isAllTestsSkipped) {
    return Status.SKIPPED;
  } else if (isAnyHookFailed) {
    return Status.BROKEN;
  } else if (isAllTestsPassedExcludeSkipped) {
    return Status.PASSED;
  }
  return Status.BROKEN;
}
