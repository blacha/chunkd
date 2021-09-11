import { SourceMemory } from '../chunk.source.memory';
import { assert } from 'console';

async function main(): Promise<void> {
  const chunks = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7]);
  const source = new SourceMemory('memory', chunks);
  source.chunkSize = 1;
  for (let i = 0; i < 8; i++) source.chunks.set(i, new DataView(new Uint8Array([i]).buffer));

  const view = new DataView(SourceMemory.toArrayBuffer(chunks));
  for (let i = 0; i < 100_000; i++) {
    await source.loadBytes(0, 8);

    assert(source.isOneChunk(0, 2) == null);
    assert(source.getUint16(0) === view.getUint16(0, true));
    assert(source.getUint16(2) === view.getUint16(2, true));
    assert(source.getUint16(4) === view.getUint16(4, true));
    assert(source.getUint16(6) === view.getUint16(6, true));

    assert(source.isOneChunk(0, 4) === null);
    assert(source.getUint32(0) === view.getUint32(0, true));
    assert(source.getUint32(2) === view.getUint32(2, true));
    assert(source.getUint32(4) === view.getUint32(4, true));

    assert(source.isOneChunk(0, 16) === null);
    assert(source.getUint64(0) === Number(view.getBigUint64(0, true)));
    assert(source.getBigUint64(0) === view.getBigUint64(0, true));
  }
}

main();
