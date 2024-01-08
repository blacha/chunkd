import assert from 'node:assert';
import { describe, it } from 'node:test';

import { toArray, toFirst } from '../generator.js';

// eslint-disable-next-line @typescript-eslint/require-await
async function* generator(iMax = 10): AsyncGenerator<number> {
  for (let i = 0; i < iMax; i++) yield i;
}
describe('generator.first', () => {
  it('should get the first number', async () => {
    const gen = generator();
    const val = await toFirst(gen);
    assert.equal(val, 0);
  });

  it('should not die if the generator gives nothing', async () => {
    async function* generator(): AsyncGenerator<number> {
      // Noop
    }
    const val = await toFirst(generator());
    assert.equal(val, undefined);
  });
});

describe('generator.toArray', () => {
  it('should convert to a array', async () => {
    const arr = await toArray(generator());
    assert.deepEqual(arr, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
