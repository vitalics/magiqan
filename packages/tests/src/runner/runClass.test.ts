import { Kind, Status } from '@magiqan/constants';
import { test, testable } from '@magiqan/core'
import { runner } from '@magiqan/runner';
import type { Test } from '@magiqan/types';

describe('runner.runFile()', () => {
  it('should passed with one simple test without inheritance', async () => {
    @testable()
    class Testable {
      @test()
      test1() {
        expect(true).toBe(true)
      }
    }

    const result = await runner.runClass(Testable);

    expect(result.result).toBe(Status.PASSED);
    expect(result.ctor).toBe(Testable);
    expect(result.name).toBe(Testable.name);
    expect(result.results[0]).toMatchObject<Test>({ isHook: false, kind: Kind.test, name: 'test1', });
  })
});
