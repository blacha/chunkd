import { ContentRange, SourceCallback, SourceError, SourceMiddleware, SourceRequest } from '@chunkd/source';

interface SourceChunkOptions {
  /**
   *  Number of bytes to split a chunk on
   * @default 32 * 1024 (32KB)
   */
  size?: number;
}
/**
 * Chunk requests into requests of specific byte sizes
 * If a request is split into smaller chunks should that be re-run as smaller requests and combined later
 *
 * This can **GREATLY** increase cache hits when using a @see {SourceCache}
 */
export class SourceChunk implements SourceMiddleware {
  name = 'source:chunk';
  /** Number of bytes to chunk requests into */
  chunkSize: number;

  constructor(opts: SourceChunkOptions) {
    this.chunkSize = opts.size ?? 32 * 1024;
  }

  async fetch(req: SourceRequest, next: SourceCallback): Promise<ArrayBuffer> {
    // Reading from the end
    if (req.offset < 0) return next(req);

    // Reading entire file, no need to chunk it
    if (req.length == null) return next(req);

    const startChunkId = Math.floor(req.offset / this.chunkSize);
    const endChunkId = Math.ceil((req.offset + req.length) / this.chunkSize);

    // Do no try and read past the end of the file
    const maxSize = req.source.metadata?.size;
    if (maxSize != null && req.offset + req.length > maxSize) {
      throw new SourceError(
        `Request outside of bounds ${ContentRange.toRange(req.offset, req.length)}`,
        416,
        req.source,
      );
    }

    const startByte = startChunkId * this.chunkSize;
    const endByte = maxSize != null ? Math.min(endChunkId * this.chunkSize, maxSize) : endChunkId * this.chunkSize;
    const maxLength = endByte - startByte;
    const chunkOffset = req.offset - startByte;

    const chunkCount = endChunkId - startChunkId;
    // If there are multiple chunks required should it be split into multiple requests
    if (chunkCount > 1) {
      const bytes = await this.fetchChunks(req, startChunkId, endChunkId);
      return bytes.slice(chunkOffset, chunkOffset + req.length);
    }

    // Request is already requesting a exact chunk no need to slice buffers or modify the request
    if (req.offset === startByte && req.length === maxLength) return next(req);

    const buffer = await next({ ...req, offset: startByte, length: maxLength });
    return buffer.slice(chunkOffset, chunkOffset + req.length);
  }

  async fetchChunks(req: SourceRequest, startId: number, endId: number): Promise<ArrayBuffer> {
    const promises: Promise<ArrayBuffer>[] = [];

    const maxEndByte = req.source.metadata?.size ?? endId * this.chunkSize;

    for (let chunk = startId; chunk < endId; chunk++) {
      const startByte = chunk * this.chunkSize;
      const endByte = Math.min(startByte + this.chunkSize, maxEndByte);
      const chunkLength = endByte - startByte;
      promises.push(req.source.fetch(chunk * this.chunkSize, chunkLength));
    }

    const results = await Promise.all(promises);
    const outputBuffer = new Uint8Array(promises.length * this.chunkSize);

    for (let i = 0; i < results.length; i++) {
      outputBuffer.set(new Uint8Array(results[i]), i * this.chunkSize);
    }

    return outputBuffer.buffer;
  }
}
