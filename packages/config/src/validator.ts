import Ajv from 'ajv';

import { schema } from './schema';

const ajv = new Ajv();

const validateFn = ajv.compile(schema);

export function validate(data: unknown) {
  const valid = validateFn(data);
  if (!valid) {
    throw new Error(`Config validation error: ${JSON.stringify(validateFn.errors)}`);
  }
}

export function isValid(data: unknown) {
  const valid = validateFn(data);
  if (!valid) {
    return false;
  }
  return true;
}
