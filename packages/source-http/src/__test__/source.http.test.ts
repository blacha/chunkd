import o from 'ospec';
import 'source-map-support/register.js';
import { SourceHttp } from '../http.source.js';

export interface HttpHeaders {
  Range: string;
}

function getCB(source: SourceHttp, index: number): DataView {
  const chunk = source.chunks.get(index);
  if (chunk != null) return chunk;
  throw Error(`Missing chunk ${index}`);
}

o.spec('SourceHttp', () => {
  let source: SourceHttp;
  let ranges: string[];

  // Fake fetch that returns the number of the byte that was requested
  SourceHttp.fetch = (url: string, obj: Record<string, HttpHeaders>): any => {
    const [startByte, endByte] = obj.headers.Range.split('=')[1]
      .split('-')
      .map((i) => parseInt(i, 10));
    const bytes = [];
    ranges.push(obj.headers.Range);
    for (let i = startByte; i < endByte; i++) {
      bytes.push(i);
    }
    const buffer = new Uint8Array(bytes).buffer;
    const arrayBuffer = (): any => Promise.resolve(buffer);
    return Promise.resolve({ arrayBuffer, ok: true, headers: new Map() }) as any;
  };

  o.beforeEach(() => {
    source = new SourceHttp('https://foo');
    source.chunkSize = 1;
    ranges = [];
  });

  o('should group fetches together', async () => {
    await source.loadBytes(0, 2);

    o([...source.chunks.keys()]).deepEquals([0, 1]);
    o(source.getUint8(0)).equals(0);
    o(source.getUint8(1)).equals(1);
  });

  o('should group big fetches', async () => {
    await source.loadBytes(0, 2);
    await source.loadBytes(0, 5);

    o([...source.chunks.keys()]).deepEquals([0, 1, 2, 3, 4]);

    for (let i = 0; i < 5; i++) {
      o(source.getUint8(i)).equals(i);
      o(source.chunks.get(i)?.getUint8(0)).equals(i);
    }
  });

  o('should handle bigger buffers', async () => {
    const MAX_BYTE = 256;
    source.chunkSize = 32;

    await source.loadBytes(0, MAX_BYTE);

    o([...source.chunks.keys()]).deepEquals([0, 1, 2, 3, 4, 5, 6, 7]);

    for (let i = 0; i < MAX_BYTE; i++) {
      o(source.getUint8(i)).equals(i);
    }

    for (let i = 0; i < MAX_BYTE / source.chunkSize; i++) {
      const view = getCB(source, i);
      for (let x = 0; x < source.chunkSize; x++) {
        o(view.getUint8(x)).equals(i * source.chunkSize + x);
      }
    }
  });

  o('should handle part requests', async () => {
    source.chunkSize = 2;
    await source.loadBytes(2, 3);

    o(source.getUint8(2)).equals(2);
    o(source.getUint8(3)).equals(3);
    o(source.getUint8(4)).equals(4);

    o(getCB(source, 1).byteLength).equals(2);
    o(getCB(source, 2).byteLength).equals(2);
  });

  o('should handle out of order requests', async () => {
    source.chunkSize = 2;
    await Promise.all([source.loadBytes(8, 3), source.loadBytes(1, 3)]);

    o(source.getUint8(0)).equals(0);
    o(source.getUint8(1)).equals(1);
    o(source.getUint8(2)).equals(2);
    o(source.getUint8(8)).equals(8);
    o(source.getUint8(9)).equals(9);
    o(source.getUint8(10)).equals(10);
  });
});
