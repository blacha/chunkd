import o from 'ospec';
import 'source-map-support/register';
import { ChunkSourceBase } from '../chunk.source';

o.spec('SourceChunked', () => {
  o('should compute byte ranges', () => {
    const chunks = ChunkSourceBase.getByteRanges(new Set([1, 2, 3]), 10);
    o(chunks.chunks).deepEquals([[1, 2, 3]]);
  });

  o('should limit max ranges', () => {
    const chunks = ChunkSourceBase.getByteRanges(new Set([1, 2, 3]), 2);
    o(chunks.chunks).deepEquals([[1, 2], [3]]);
  });

  o('should support sparse chunks', () => {
    const chunks = ChunkSourceBase.getByteRanges(new Set([1, 2, 30]), 10);
    o(chunks.chunks).deepEquals([[1, 2], [30]]);
  });

  o('should fill in blanks even though they are not requested', () => {
    const chunks = ChunkSourceBase.getByteRanges(new Set([1, 2, 6]), 10, 5);
    o(chunks.chunks).deepEquals([[1, 2, 3, 4, 5, 6]]);
    o(chunks.blankFill).deepEquals([3, 4, 5]);
  });
});
