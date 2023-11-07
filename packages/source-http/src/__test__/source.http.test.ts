import assert from 'node:assert';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import { FetchLikeOptions, SourceHttp } from '../index.js';

export interface HttpHeaders {
  Range: string;
}

describe('SourceHttp', () => {
  let source: SourceHttp;
  let ranges: string[];

  before(() => {
    // Fake fetch that returns the number of the byte that was requested
    SourceHttp.fetch = (_, obj?: FetchLikeOptions): any => {
      const rangeHeader = obj?.headers?.range;
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

  it('should support string URLs', () => {
    const source = new SourceHttp('https://foo.com/bar');
    assert.equal(source.url.href, 'https://foo.com/bar');
  });

  // Should these throw if import.meta.url is not a http?
  describe('import.meta.url', () => {
    it('should support "/"', () => {
      const source = new SourceHttp('/bar.txt');
      // Windows will report `file://D:/bar.txt` linux `file:///bar.txt`
      const baseUrl = new URL('/', import.meta.url);
      assert.equal(source.url.href, baseUrl.href + 'bar.txt');
    });

    it('should support "./', () => {
      const source = new SourceHttp('./bar.txt');
      assert.equal(source.url.protocol, 'file:');
      assert.ok(source.url.href.endsWith('/src/bar.txt'));
    });
  });

  describe('document.baseURI', () => {
    let oldDoc: any;
    beforeEach(() => {
      oldDoc = global.document;
      global.document = { baseURI: 'https://example.com/foo/index.html' } as any;
    });

    afterEach(() => {
      global.document = oldDoc;
    });

    it('should use support "/" ', () => {
      const source = new SourceHttp('/bar.txt');
      assert.equal(source.url.href, 'https://example.com/bar.txt');
    });

    it('should support ".."', () => {
      const sourceRelUp = new SourceHttp('../bar.txt');
      assert.equal(sourceRelUp.url.href, 'https://example.com/bar.txt');
    });

    it('should support "./"', () => {
      const sourceRelUp = new SourceHttp('./bar.txt');
      assert.equal(sourceRelUp.url.href, 'https://example.com/foo/bar.txt');
    });

    it('should should support "../../../"', () => {
      const sourceRelUp = new SourceHttp('../../../bar.txt');
      assert.equal(sourceRelUp.url.href, 'https://example.com/bar.txt');
    });
  });
});
