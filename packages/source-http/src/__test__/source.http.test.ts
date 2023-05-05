import assert from 'node:assert';
import { after, before, beforeEach, describe, it } from 'node:test';
import { FetchLikeOptions, SourceHttp } from '../index.js';

export function assertObject(o: unknown, message: string): asserts o is Record<string, unknown> {
  if (o == null) throw new Error(`Object is null: ${message}`);
}

export interface HttpHeaders {
  Range: string;
}

describe('SourceHttp', () => {
  let source: SourceHttp;
  let ranges: string[];

  before(() => {
    // Fake fetch that returns the number of the byte that was requested
    SourceHttp.fetch = (_, obj?: FetchLikeOptions): any => {
      const rangeHeader = obj?.headers?.Range;
      if (rangeHeader == null) throw new Error('No headers');
      const [startByte, endByte] = rangeHeader
        .split('=')[1]
        .split('-')
        .map((i) => parseInt(i, 10));
      const bytes = [];
      ranges.push(rangeHeader);
      for (let i = startByte; i < endByte; i++) {
        bytes.push(i);
      }
      const buffer = new Uint8Array(bytes).buffer;
      const arrayBuffer = (): any => Promise.resolve(buffer);
      return Promise.resolve({ arrayBuffer, ok: true, headers: new Map() }) as any;
    };
  });

  after(() => {
    SourceHttp.fetch = fetch;
  });

  beforeEach(() => {
    source = new SourceHttp(new URL('https://foo'));
    ranges = [];
  });

  it('should fetch part of the file', async () => {
    await source.fetch(0, 1024);
    assert.equal(ranges[0], 'bytes=0-1023');
  });

  it('should fetch part of the file multiple times', async () => {
    await source.fetch(0, 1024);
    assert.equal(ranges[0], 'bytes=0-1023');
    await source.fetch(0, 1024);
    assert.equal(ranges[1], 'bytes=0-1023');
  });

  it('should fetch negative parts', async () => {
    await source.fetch(-1024);
    assert.equal(ranges[0], 'bytes=-1024');
  });

  it('should fetch at offsets parts', async () => {
    await source.fetch(1024, 1024);
    assert.equal(ranges[0], 'bytes=1024-2047');
  });
});
