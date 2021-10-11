import { writeFileSync } from 'fs';

import { schema } from './schema';

export default function generate() {
  writeFileSync('./generated.json', JSON.stringify(schema.valueOf(), null, 2));
}

generate();
