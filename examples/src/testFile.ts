import { promisify } from 'util';
import { setTimeout } from 'timers';

import { beforeAll, test, testable, MetadataManager } from '@magiqan/core';
const delay = promisify(setTimeout);

class Base {

  metadata = new MetadataManager(this);
  @beforeAll()
  beforeAll() {
    this.metadata.defineMetadata('beforeAll', 'some key', 'some value')
    // console.log('before all');
  }
}

@testable()
export class SomeTest extends Base {
  @test()
  async someTest() {
    // console.log('some test');
    await delay(40, 'qwe', {});
    this.metadata.defineMetadata('someTest', 'key', 'value')
  }

}
