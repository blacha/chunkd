import o from 'ospec';
import 'source-map-support/register';
import { ByteSize } from '../bytes';
import { ChunkId } from '../chunk.source';
import { SourceMemory } from '../chunk.source.memory';
import { FakeChunkSource } from './chunk.source.fake';

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
    o(source.uint8(0)).equals(0);
    o(source.uint16(0)).equals(256);

    o(source.uint32(0)).equals(50462976);
    o(source.uint32(4)).equals(117835012);

    o(source.uint64(0)).equals(getUint64(chunk, 0, true));
  });

  o('should get unit8 from range', async () => {
    await Chunk(0);
    for (let i = 0; i < 10; i++) o(source.uint8(i)).equals(i);
  });

  o('should use chunk offset', async () => {
    await Chunk(1);
    o(source.uint8(10)).equals(10);
  });

  o('should disable request tracking', async () => {
    source.isRequestsTracked = false;
    await Chunk(1);
    o(source.requests.length).equals(0);
  });

  o('should support multiple chunks', async () => {
    await Chunk(1);
    await Chunk(2);
    await Chunk(3);

    for (let i = 10; i < source.chunkSize * 3; i++) {
      o(source.uint8(i)).equals(i);
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
      o(chunk.getUint16(i, source.isLittleEndian)).equals(source.uint16(i));
    }
  });

  for (const isLittleEndian of [true, false]) {
    const word = isLittleEndian ? 'LE' : 'BE';
    o(`should fetch uint16 (${word})`, async () => {
      source.isLittleEndian = isLittleEndian;

      const chunk = await Chunk(0);
      for (let i = 0; i < source.chunkSize - ByteSize.UInt16; i++) {
        o(chunk.getUint16(i, source.isLittleEndian)).equals(source.uint16(i));
      }
    });

    o(`should fetch uint32 (${word})`, async () => {
      source.isLittleEndian = isLittleEndian;

      const chunk = await Chunk(0);
      for (let i = 0; i < source.chunkSize - ByteSize.UInt32; i++) {
        o(chunk.getUint32(i, source.isLittleEndian)).equals(source.uint32(i));
      }
    });

    o(`should fetch uint64 (${word})`, async () => {
      source.isLittleEndian = isLittleEndian;

      const chunk = await Chunk(0);
      for (let i = 0; i < source.chunkSize - ByteSize.UInt64; i++) {
        o(getUint64(chunk, i, source.isLittleEndian)).equals(source.uint64(i));
      }
    });

    o(`should read bigint 64 (${word})`, async () => {
      source.isLittleEndian = isLittleEndian;

      const chunk = await Chunk(0);
      for (let i = 0; i < source.chunkSize - ByteSize.UInt64; i++) {
        o(chunk.getBigUint64(i, source.isLittleEndian)).equals(source.bigUint64(i));
      }
    });

    o(`should read across chunk boundary (${word})`, async () => {
      const chunks = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7]);
      const view = new DataView(SourceMemory.toArrayBuffer(chunks));
      source.isLittleEndian = isLittleEndian;
      source.chunkSize = 1;

      await source.loadBytes(0, 8);

      o(source.isOneChunk(0, 2)).equals(null);
      o(source.uint16(0)).equals(view.getUint16(0, isLittleEndian));
      o(source.uint16(2)).equals(view.getUint16(2, isLittleEndian));
      o(source.uint16(4)).equals(view.getUint16(4, isLittleEndian));
      o(source.uint16(6)).equals(view.getUint16(6, isLittleEndian));

      o(source.isOneChunk(0, 4)).equals(null);
      o(source.uint32(0)).equals(view.getUint32(0, isLittleEndian));
      o(source.uint32(2)).equals(view.getUint32(2, isLittleEndian));
      o(source.uint32(4)).equals(view.getUint32(4, isLittleEndian));

      o(source.isOneChunk(0, 16)).equals(null);
      o(source.uint64(0)).equals(Number(view.getBigUint64(0, isLittleEndian)));
      o(source.bigUint64(0)).equals(view.getBigUint64(0, isLittleEndian));
    });
  }

  o('should correctly sign uint32', () => {
    const chunks = Buffer.from([75, 168, 242, 148]);
    const source = new SourceMemory('source', chunks);
    source.isOneChunk = (): null => null;

    const view = new DataView(SourceMemory.toArrayBuffer(chunks));
    o(source.uint32(0)).equals(view.getUint32(0, true));
  });

  o('should uint16 across chunks', async () => {
    source.chunkSize = 1;
    await Chunk(0);
    await Chunk(1);
    o(source.uint16(0)).equals(256);
  });

  o('should uint32 across chunks', async () => {
    source.chunkSize = 1;
    await Chunk(0);
    await Chunk(1);
    await Chunk(2);
    await Chunk(3);
    o(source.uint32(0)).equals(50462976);
  });

  o('should uint64 when numbers are close', async () => {
    source.chunkSize = 2048;
    await Chunk(31);
    // This causes chunks to be read from chunks 31.9990234375 and 32.0029296875
    // which when should be reading part from chunk 31 and chunk 32

    o(() => source.uint64(65534)).throws('Chunk:32 is not ready');

    await Chunk(32);

    o(source.uint64(65534) > 0).equals(true);
  });
});
