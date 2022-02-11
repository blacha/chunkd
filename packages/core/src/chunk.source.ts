import { ChunkSource } from './source.js';
import { ByteSize } from './bytes.js';
import { LogType } from './log.js';
export type ChunkId = number & { _type: 'chunkId' };

/** Shifting `<< 32` does not work in javascript */
const POW_32 = 2 ** 32;

const setNext: (cb: () => void, delay?: number) => void =
  typeof setImmediate === 'undefined' ? setTimeout : setImmediate;

const NotImplemented = (): number => {
  throw new Error('Method not implemented.');
};

/** Tiny map implementation so its easy to override */
interface TinyMap<K, V> {
  size: number;
  get(key: K): V | undefined;
  set(key: K, value: V): unknown;
  has(key: K): boolean;
}

/**
 * Chunked source for remote data
 *
 * Split a source into smaller chunks and load the bytes required in chunkSize amounts at a time
 *
 * This will also handle joining of consecutive requests, even when it is semi consecutive
 */
export abstract class ChunkSourceBase implements ChunkSource {
  /** By default record a log of requests made by chunked sources */
  static DefaultTrackRequests = false;

  /** By default create a new cache for every chunk source */
  static DefaultChunkCache = (): TinyMap<number, DataView> => new Map<number, DataView>();

  /** By default wait this amount of ms before running a fetch */
  static DefaultDelayMs = 1;

  /** size of chunks to fetch (Bytes) */
  abstract chunkSize: number;
  /** Reference to the source */
  abstract uri: string;
  /** Type of the source, should be unique across all source types */
  abstract type: string;
  /** Protocol prefix for the file handler eg "file" or "s3" */
  abstract protocol: string;

  /** Is this source little endian */
  isLittleEndian = true;

  /**
   * Number of ms to wait before performing a fetch
   * Larger numbers means more fetches will be grouped together
   */
  delayMs = ChunkSourceBase.DefaultDelayMs;
  /**
   * Max number of chunks to load in one go
   * Requested chunks could be more than this number if blankFillCount is used
   *
   * @default 10
   */
  maxChunkCount = 10;

  // TODO this should ideally be a LRU
  // With a priority for the first few chunks (Generally where the main IFD resides)
  chunks: TinyMap<number, DataView> = ChunkSourceBase.DefaultChunkCache();

  /**
   * Number of non requested chunks to load
   *
   * This allows one fetch for semi sparse requests eg requested [1,5]
   * instead of two fetches [1] & [5] run one fetch [1,2,3,4,5]
   */
  blankFillCount = 16;

  /** Maximum number of chunks to be requested at one time */
  maxConcurrentRequests = 50;

  /* List of chunk ids to fetch */
  protected toFetch: Set<number> = new Set();
  protected toFetchPromise: Promise<void> | null = null;

  /**
   * Directly read from the source
   *
   * **Warning** this method will bypass any caching or chunking
   *
   *
   * @example
   *  source.fetchBytes(0, 1024)
   *  source.fetchBytes(1024, 20)
   *  source.fetchBytes(-1024)
   *
   * @param offset Byte to start reading form
   * @param length optional number of bytes to read
   * @param log optional logger to track requests with
   */
  abstract fetchBytes(offset: number, length?: number, log?: LogType): Promise<ArrayBuffer>;

  /** Byte size of the file */
  abstract size: Promise<number>;

  /** Close the source, cleaning up any open connections/file descriptors */
  close?(): Promise<void>;

  /**
     * Split the ranges into a consecutive chunks

     * @param ranges list of chunks to fetch

     * @param maxChunks maximum number of chunks to load
     */
  static getByteRanges(
    ranges: Set<number>,
    chunkCount = 32,
    blankFillCount = 16,
  ): { chunks: number[][]; blankFill: number[] } {
    if (ranges.size === 0) return { chunks: [], blankFill: [] };

    const sortedRange = [...ranges.values()].sort((a, b) => a - b);

    const chunks: number[][] = [];
    let current: number[] = [];
    chunks.push(current);
    const blankFill = [];

    for (let i = 0; i < sortedRange.length; ++i) {
      const currentValue = sortedRange[i];
      const lastValue = sortedRange[i - 1];
      if (current.length >= chunkCount) {
        current = [currentValue];
        chunks.push(current);
      } else if (i === 0 || currentValue === lastValue + 1) {
        current.push(currentValue);
      } else if (currentValue < lastValue + blankFillCount) {
        // Allow for non continuos chunks to be requested to save on fetches
        for (let x = lastValue; x < currentValue; x++) {
          current.push(x + 1);
          blankFill.push(x + 1);
        }
        // Last value was actually requested so its not a blank fill
        blankFill.pop();
      } else {
        current = [currentValue];
        chunks.push(current);
      }
    }
    return { chunks, blankFill };
  }

  private async fetchData(logger?: LogType): Promise<void> {
    if (this.toFetch.size === 0) return;
    const chunkIds = this.toFetch;
    this.toFetch = new Set();
    this.toFetchPromise = null;

    const ranges = ChunkSourceBase.getByteRanges(chunkIds, this.maxChunkCount, this.blankFillCount);

    const chunkData: ArrayBuffer[] = [];

    const startAt = Date.now();
    // TODO putting this in a promise queue to do multiple requests
    // at a time would be a good idea.
    for (const chunkRange of ranges.chunks) {
      const firstChunk = chunkRange[0];
      const lastChunk = chunkRange[chunkRange.length - 1];
      const req = { startAt, requestStartAt: Date.now(), endAt: -1, chunks: chunkRange };

      const offset = firstChunk * this.chunkSize;
      const length = lastChunk * this.chunkSize + this.chunkSize - offset;

      const startTime = Date.now();
      const buffer = await this.fetchBytes(offset, length, logger);
      req.endAt = Date.now();
      logger?.info(
        {
          uri: this.uri,
          source: this.type,
          bytes: length,
          chunks: chunkRange,
          chunkCount: chunkRange.length,
          duration: Date.now() - startTime,
        },
        'FetchChunk',
      );
      if (chunkRange.length === 1) {
        chunkData[firstChunk] = buffer;
        this.chunks.set(firstChunk, new DataView(buffer));
        continue;
      }

      const rootOffset = firstChunk * this.chunkSize;
      for (const chunkId of chunkRange) {
        const chunkOffset = chunkId * this.chunkSize - rootOffset;
        const chunkBuffer = buffer.slice(chunkOffset, chunkOffset + this.chunkSize);
        chunkData[chunkId] = chunkBuffer;
        this.chunks.set(chunkId, new DataView(chunkBuffer));
      }
    }
  }

  /**
   * Load bytes into memory
   *
   * @param offset byte offset to start reading from
   * @param length number of bytes to load
   * @param log optional logger to log requests
   */
  public async loadBytes(offset: number, length: number, log?: LogType): Promise<void> {
    if (offset < 0) throw new Error('Offset must be positive');
    const startChunk = Math.floor(offset / this.chunkSize);
    const endChunk = Math.ceil((offset + length) / this.chunkSize) - 1;

    for (let i = startChunk; i <= endChunk; i++) {
      if (this.chunks.has(i)) continue;
      this.toFetch.add(i);
    }
    if (this.toFetch.size === 0) return;

    // Queue a fetch
    if (this.toFetchPromise == null) {
      this.toFetchPromise = new Promise<void>((resolve) => setNext(resolve, this.delayMs)).then(() => {
        return this.fetchData(log);
      });
    }

    if (this.toFetch.size > this.maxConcurrentRequests) throw new Error('Too many outstanding requests');

    await this.toFetchPromise;
  }

  private getChunkId(offset: number): ChunkId {
    return Math.floor(offset / this.chunkSize) as ChunkId;
  }

  getUint(offset: number, bs: ByteSize): number {
    switch (bs) {
      case ByteSize.UInt8:
        return this.getUint8(offset);
      case ByteSize.UInt16:
        return this.getUint16(offset);
      case ByteSize.UInt32:
        return this.getUint32(offset);
      case ByteSize.UInt64:
        return this.getUint64(offset);
    }
  }

  /**
   * Read a byte array at the offset
   * @param offset offset to read from
   * @param count number of bytes to read
   */
  bytes(offset: number, count: number): Uint8Array {
    const firstChunkId = this.isOneChunk(offset, count);
    if (firstChunkId) {
      const chunk = this.getView(firstChunkId);
      const startOffset = offset - firstChunkId * this.chunkSize;
      return new Uint8Array(chunk.buffer.slice(startOffset, startOffset + count));
    }

    const output = new Uint8Array(count);
    const endOffset = offset + count;

    const startChunk = Math.floor(offset / this.chunkSize);
    const endChunk = Math.ceil((offset + count) / this.chunkSize) - 1;
    let outputOffset = 0;
    for (let chunkId = startChunk; chunkId <= endChunk; chunkId++) {
      const startRead = offset + outputOffset;
      const chunkOffset = chunkId * this.chunkSize;
      const view = this.getView(chunkId as ChunkId);
      const endRead = Math.min(endOffset, chunkOffset + this.chunkSize);
      const chunkBuffer = view.buffer.slice(startRead - chunkOffset, endRead - chunkOffset);
      output.set(new Uint8Array(chunkBuffer), outputOffset);
      outputOffset += chunkBuffer.byteLength;
    }

    return output;
  }

  /**
   * Get the chunk for the given id
   * @param chunkId id of the chunk to get
   */
  getView(chunkId: ChunkId): DataView {
    const view = this.chunks.get(chunkId);
    if (view == null) throw new Error(`Chunk:${chunkId} is not ready`);
    return view;
  }

  /**
   * Determine if the number of bytes are included in a single chunk
   *
   * @returns chunkId if the data is contained inside one chunk otherwise null.
   */
  isOneChunk(offset: number, byteCount: number): ChunkId | null {
    const endOffset = offset + byteCount - 1;
    const startChunk = Math.floor(offset / this.chunkSize);
    const endChunk = Math.floor(endOffset / this.chunkSize);
    if (endChunk - startChunk < 1) return startChunk as ChunkId;
    return null;
  }

  /** Check if the number of bytes has been cached so far */
  hasBytes(offset: number, length = 1): boolean {
    const startChunk = Math.floor(offset / this.chunkSize);
    const endChunk = Math.ceil((offset + length) / this.chunkSize) - 1;
    for (let chunkId = startChunk; chunkId <= endChunk; chunkId++) {
      if (!this.chunks.has(chunkId)) return false;
    }
    return true;
  }

  /** Convert a offset/length to a range request */
  protected toRange(offset: number, length?: number): string {
    if (length == null) return `bytes=${offset}`;
    if (offset < 0) throw new Error('Cannot read from remote source with negative offset and length');
    return `bytes=${offset}-${offset + length}`;
  }

  /**
   * Parse a common Content-Range header to extract the size of the source
   * @example Content-Range: bytes 200-1000/67589
   */
  protected parseContentRange(range: string): number {
    const [unit, chunks] = range.split(' ');
    if (unit !== 'bytes') throw new Error('Failed to parse content-range: ' + range);
    if (chunks == null) throw new Error('Failed to parse content-range: ' + range);
    const [, size] = chunks.split('/');
    const result = Number(size);
    if (isNaN(result)) throw new Error('Failed to parse content-range: ' + range);
    return result;
  }

  get buffer(): ArrayBuffer {
    throw new Error('Method not implemented.');
  }

  _byteLength: number;
  get byteLength(): number {
    if (this._byteLength) return this._byteLength;
    throw Error('.size() has not been fetched.');
  }
  byteOffset = 0;

  getUint8(byteOffset: number): number {
    const chunkId = Math.floor(byteOffset / this.chunkSize) as ChunkId;
    const view = this.chunks.get(chunkId);
    if (view == null) throw new Error(`Chunk:${chunkId} is not ready`);
    return view.getUint8(byteOffset - chunkId * this.chunkSize);
  }

  getUint16(byteOffset: number): number {
    const chunkId = this.isOneChunk(byteOffset, ByteSize.UInt16);
    if (chunkId != null) {
      const chunk = this.getView(chunkId);
      return chunk.getUint16(byteOffset - chunkId * this.chunkSize, this.isLittleEndian);
    }

    const intA = this.getUint8(byteOffset);
    const intB = this.getUint8(byteOffset + ByteSize.UInt8);
    if (this.isLittleEndian) return intA + (intB << 8);
    return (intA << 8) + intB;
  }

  getUint32(byteOffset: number): number {
    // If all the data is contained inside one Chunk, Load the bytes directly
    const chunkId = this.isOneChunk(byteOffset, ByteSize.UInt32);
    if (chunkId != null) {
      const chunk = this.getView(chunkId);
      return chunk.getUint32(byteOffset - chunkId * this.chunkSize, this.isLittleEndian);
    }

    const intA = this.getUint16(byteOffset);
    const intB = this.getUint16(byteOffset + ByteSize.UInt16);

    if (this.isLittleEndian) return intA + intB * 0x10000;
    return intA * 0x10000 + intB;
  }

  /**
   * Read a uint64 at the offset
   *
   * This is not precise for large numbers
   * @see uint64be
   * @param offset offset to read
   */
  getUint64(offset: number): number {
    // If all the data is contained inside one Chunk, Load the bytes directly
    const chunkId = this.isOneChunk(offset, ByteSize.UInt64);
    if (chunkId != null) {
      const chunk = this.getView(chunkId);
      return Number(chunk.getBigUint64(offset - chunkId * this.chunkSize, this.isLittleEndian));
    }

    const intA = this.getUint32(offset);
    const intB = this.getUint32(offset + ByteSize.UInt32);
    if (this.isLittleEndian) return intA + intB * POW_32; // Shifting by 32 is bad
    return intA * POW_32 + intB;
  }

  getBigUint64(byteOffset: number): bigint {
    const chunkId = this.isOneChunk(byteOffset, ByteSize.UInt64);
    if (chunkId != null) {
      const chunk = this.getView(chunkId);
      return chunk.getBigUint64(byteOffset - chunkId * this.chunkSize, this.isLittleEndian);
    }
    const intA = BigInt(this.getUint32(byteOffset));
    const intB = BigInt(this.getUint32(byteOffset + ByteSize.UInt32));
    if (this.isLittleEndian) return intA + (intB << BigInt(32));
    return (intA << BigInt(32)) + intB;
  }

  getBigInt64(): bigint {
    throw new Error('Not implemented.');
  }

  getFloat32 = NotImplemented;
  getFloat64 = NotImplemented;
  getInt8 = NotImplemented;
  getInt16 = NotImplemented;
  getInt32 = NotImplemented;
  setFloat32 = NotImplemented;
  setFloat64 = NotImplemented;
  setInt8 = NotImplemented;
  setInt16 = NotImplemented;
  setInt32 = NotImplemented;
  setUint8 = NotImplemented;
  setUint16 = NotImplemented;
  setUint32 = NotImplemented;
  setBigInt64 = NotImplemented;
  setBigUint64 = NotImplemented;
  [Symbol.toStringTag]: string;
}
