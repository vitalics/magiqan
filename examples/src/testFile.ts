import { beforeAll, test, testable } from '@magiqan/core';

class Base {
  @beforeAll()
  beforeAll() {
    console.log('before all');
  }
}

@testable()
export class SomeTest extends Base {
  @test()
  someTest() {
    console.log('some test');
  }

}
