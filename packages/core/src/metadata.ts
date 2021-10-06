import { defineClassMetadata, defineClassMethodMetadata } from '@magiqan/runtime';

export class MetadataManager<T = any> {
  constructor(readonly instance: T) { }
  defineClassMetadata(metadataKey: string, metadataValue: unknown) {
    defineClassMetadata((this.instance as any).constructor, { [metadataKey]: metadataValue });
  }
  defineMetadata<M extends keyof T>(method: M, metadataKey: string, metadataValue: unknown) {
    defineClassMethodMetadata((this.instance as any).constructor, method as string, { [metadataKey]: metadataValue })
  }
}
