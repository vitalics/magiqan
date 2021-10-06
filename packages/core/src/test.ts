import { defineClassMetadata, defineClassMethodMetadata } from '@magiqan/runtime';

export abstract class Test {
  defineClassMetadata(metadataKey: string, metadataValue: unknown) {
    defineClassMetadata(this.constructor, { [metadataKey]: metadataValue });
  }
  defineMetadata<M extends keyof this>(method: M, metadataKey: string, metadataValue: unknown) {
    defineClassMethodMetadata(this.constructor, method as string, { [metadataKey]: metadataValue })
  }
}
