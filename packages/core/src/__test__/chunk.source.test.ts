import o from 'ospec';
import 'source-map-support/register.js';
import { ByteSize } from '../bytes.js';
import { ChunkId } from '../chunk.source.js';
import { SourceMemory } from '../chunk.source.memory.js';
import { FakeChunkSource } from './chunk.source.fake.js';

// Reference uin64 from MDN
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
function getUint64(dataview: DataView, byteOffset: number, isLittleEndian: boolean): number {
  // split 64-bit number into two 32-bit (4-byte) parts
  const left = dataview.getUint32(byteOffset, isLittleEndian);
  const right = dataview.getUint32(byteOffset + 4, isLittleEndian);

  // combine the two 32-bit values
  return isLittleEndian ? left + 2 ** 32 * right : 2 ** 32 * left + right;
}

o.spec('SourceChunk', () => {
  const CHUNK_SIZE = 10;
  let source: FakeChunkSource;

  o.beforeEach(() => {
    source = new FakeChunkSource();
    source.isLittleEndian = true;
    source.chunkSize = CHUNK_SIZE;
  });

  async function Chunk(chunkId: number): Promise<DataView> {
    await source.loadBytes(chunkId * source.chunkSize, source.chunkSize, undefined);
    return source.getView(chunkId as ChunkId);
  }

  o('should get unit8', async () => {
    const chunk = await Chunk(0);
    o(source.getUint8(0)).equals(0);
    o(source.getUint16(0)).equals(256);

    o(source.getUint32(0)).equals(50462976);
    o(source.getUint32(4)).equals(117835012);

    o(source.getUint64(0)).equals(getUint64(chunk, 0, true));
  });

  o('should get unit8 from range', async () => {
    await Chunk(0);
    for (let i = 0; i < 10; i++) o(source.getUint8(i)).equals(i);
  });

  o('should use chunk offset', async () => {
    await Chunk(1);
    o(source.getUint8(10)).equals(10);
  });

  o('should disable request tracking', async () => {
    source.isRequestsTracked = false;
    await Chunk(1);
    o(source.requests.length).equals(0);
  });

  o('should support multiple chunks', async () => {
    source.isRequestsTracked = true;
    await Chunk(1);
    await Chunk(2);
    await Chunk(3);

    for (let i = 10; i < source.chunkSize * 3; i++) {
      o(source.getUint8(i)).equals(i);
    }

    o(source.requests.length).equals(3);
    o(source.requests[0].chunks).deepEquals([1]);
    o(source.requests[1].chunks).deepEquals([2]);
    o(source.requests[2].chunks).deepEquals([3]);
  });

  o('should fetch big endian', async () => {
    source.isLittleEndian = false;
    const chunk = await Chunk(0);
    for (let i = 0; i < source.chunkSize - 1; i++) {
      o(chunk.getUint16(i, source.isLittleEndian)).equals(source.getUint16(i));
    }
  });

  for (const isLittleEndian of [true, false]) {
    const word = isLittleEndian ? 'LE' : 'BE';
    o(`should fetch uint16 (${word})`, async () => {
      source.isLittleEndian = isLittleEndian;

      const chunk = await Chunk(0);
      for (let i = 0; i < source.chunkSize - ByteSize.UInt16; i++) {
        o(chunk.getUint16(i, source.isLittleEndian)).equals(source.getUint16(i));
      }
    });

    o(`should fetch uint32 (${word})`, async () => {
      source.isLittleEndian = isLittleEndian;

      const chunk = await Chunk(0);
      for (let i = 0; i < source.chunkSize - ByteSize.UInt32; i++) {
        o(chunk.getUint32(i, source.isLittleEndian)).equals(source.getUint32(i));
      }
    });

    o(`should fetch uint64 (${word})`, async () => {
      source.isLittleEndian = isLittleEndian;

      const chunk = await Chunk(0);
      for (let i = 0; i < source.chunkSize - ByteSize.UInt64; i++) {
        o(getUint64(chunk, i, source.isLittleEndian)).equals(source.getUint64(i));
      }
    });

    o(`should read bigint 64 (${word})`, async () => {
      source.isLittleEndian = isLittleEndian;

      const chunk = await Chunk(0);
      for (let i = 0; i < source.chunkSize - ByteSize.UInt64; i++) {
        o(chunk.getBigUint64(i, source.isLittleEndian)).equals(source.getBigUint64(i));
      }
    });

    o(`should read across large chunk boundaries (${word})`, async () => {
      const chunks = Buffer.alloc(1024);
      for (let i = 0; i < chunks.length; i++) chunks[i] = i;
      const view = new DataView(SourceMemory.toArrayBuffer(chunks));
      source.isLittleEndian = isLittleEndian;
      source.chunkSize = 256;

      await source.loadBytes(254, 2);
      o(source.chunks.size).equals(1);

      o(source.isOneChunk(254, 2)).equals(0 as ChunkId);
      o(source.getUint16(254)).equals(view.getUint16(254, isLittleEndian));

      await source.loadBytes(255, 2);
      o(source.chunks.size).equals(2);

      o(source.isOneChunk(255, 2)).equals(null);
      o(source.getUint16(255)).equals(view.getUint16(255, isLittleEndian));
    });

    o(`should read across chunk boundary (${word})`, async () => {
      const chunks = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7]);
      const view = new DataView(SourceMemory.toArrayBuffer(chunks));
      source.isLittleEndian = isLittleEndian;
      source.chunkSize = 1;

      await source.loadBytes(0, 8);

      o(source.isOneChunk(0, 2)).equals(null);
      o(source.getUint16(0)).equals(view.getUint16(0, isLittleEndian));
      o(source.getUint16(2)).equals(view.getUint16(2, isLittleEndian));
      o(source.getUint16(4)).equals(view.getUint16(4, isLittleEndian));
      o(source.getUint16(6)).equals(view.getUint16(6, isLittleEndian));

      o(source.isOneChunk(0, 4)).equals(null);
      o(source.getUint32(0)).equals(view.getUint32(0, isLittleEndian));
      o(source.getUint32(2)).equals(view.getUint32(2, isLittleEndian));
      o(source.getUint32(4)).equals(view.getUint32(4, isLittleEndian));

      o(source.isOneChunk(0, 16)).equals(null);
      o(source.getUint64(0)).equals(Number(view.getBigUint64(0, isLittleEndian)));
      o(source.getBigUint64(0)).equals(view.getBigUint64(0, isLittleEndian));

      source.chunkSize = 2;
      source.chunks = new Map();
      await source.loadBytes(0, 8);

      o(source.isOneChunk(0, 2)).equals(0 as ChunkId);
      o(source.getUint16(0)).equals(view.getUint16(0, isLittleEndian));
    });
  }

  o('should correctly sign uint32', () => {
    const chunks = Buffer.from([75, 168, 242, 148]);
    const source = new SourceMemory('source', chunks);
    source.isOneChunk = (): null => null;

    const view = new DataView(SourceMemory.toArrayBuffer(chunks));
    o(source.getUint32(0)).equals(view.getUint32(0, true));
  });

  o('should uint16 across chunks', async () => {
    source.chunkSize = 1;
    await Chunk(0);
    await Chunk(1);
    o(source.getUint16(0)).equals(256);
  });

  o('should uint32 across chunks', async () => {
    source.chunkSize = 1;
    await Chunk(0);
    await Chunk(1);
    await Chunk(2);
    await Chunk(3);
    o(source.getUint32(0)).equals(50462976);
  });

  o('should uint64 when numbers are close', async () => {
    source.chunkSize = 2048;
    await Chunk(31);
    // This causes chunks to be read from chunks 31.9990234375 and 32.0029296875
    // which when should be reading part from chunk 31 and chunk 32

    o(() => source.getUint64(65534)).throws('Chunk:32 is not ready');

    await Chunk(32);

    o(source.getUint64(65534) > 0).equals(true);
  });
});
