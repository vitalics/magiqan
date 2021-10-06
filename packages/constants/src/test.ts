export enum Status {
  PENDING = 'pending',
  PASSED = 'passed',
  FAILED = 'failed',
  BROKEN = 'broken',
  SKIPPED = 'skipped',
}

// when compile - use values instead of reference
export enum Kind {
  beforeAll = 'beforeAll',
  beforeEach = 'beforeEach',
  test = 'test',
  afterEach = 'afterEach',
  afterAll = 'afterAll',
}
