import o from 'ospec';
import { SourceMemory } from '../chunk.source.memory';

o.spec('MemorySource', () => {
  o('should read from memory', async () => {
    const obj = Buffer.from('abc');
    const sourceMemory = new SourceMemory('Abc', SourceMemory.toArrayBuffer(obj));

    const firstByte = await sourceMemory.fetchBytes(0, 1);
    o(String.fromCharCode(new Uint8Array(firstByte)[0])).equals('a');

    const lastByte = await sourceMemory.fetchBytes(-1);
    o(String.fromCharCode(new Uint8Array(lastByte)[0])).equals('c');

    o(sourceMemory.uint8(0)).equals('a'.charCodeAt(0));
    o(sourceMemory.uint8(1)).equals('b'.charCodeAt(0));
    o(sourceMemory.uint8(2)).equals('c'.charCodeAt(0));
  });
});
