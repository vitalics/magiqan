import type { JSONSchemaType } from 'ajv';

import type { Config } from './types';

export const schema: JSONSchemaType<Config> = {
  type: 'object',
  additionalProperties: true,
  properties: {
    debug: { type: 'boolean', nullable: true },
    env: { type: 'object', nullable: true },
    exclude: { type: 'array', items: { type: 'string' }, nullable: true },
    files: { type: 'array', items: { type: 'string' }, nullable: true },
    log: { type: 'boolean', nullable: true },
    logLevel: { type: 'string', nullable: true },
    outputDir: { type: 'string', nullable: true },

    reporter: { type: 'string', nullable: true, },
    shareWorkerEnv: { type: 'boolean', nullable: true },
    timeout: { type: 'number', default: 5000, nullable: true },
    workers: { type: 'number', default: 1, maximum: 10, minimum: 1, nullable: true },
  },
  required: ['files'],
};
