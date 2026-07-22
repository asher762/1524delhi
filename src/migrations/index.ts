import * as migration_20260722_220231 from './20260722_220231';

export const migrations = [
  {
    up: migration_20260722_220231.up,
    down: migration_20260722_220231.down,
    name: '20260722_220231'
  },
];
