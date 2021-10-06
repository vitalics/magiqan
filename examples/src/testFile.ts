import { beforeAll, test, testable, MetadataManager } from '@magiqan/core';

class Base {

  metadata = new MetadataManager(this);
  @beforeAll()
  beforeAll() {
    this.metadata.defineMetadata('beforeAll', 'some key', 'some value')
    console.log('before all');
  }
}

@testable()
export class SomeTest extends Base {
  @test()
  someTest() {
    console.log('some test');
    this.metadata.defineMetadata('someTest', 'key', 'value')
  }

}
