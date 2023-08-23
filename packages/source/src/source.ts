/** @typedef {Error} SourceError */

export interface Source {
  /**
   * human friendly name of the source type
   * @example "aws:s3", "file", "memory"
   */
  type: string;

  /**
   * URL to the source
   *
   * @example "s3://linz-imagery/catalog.json" or "file:///home/blacha/18_126359_137603.webp"
   */
  url: URL;

  /**
   * Metadata about the object the source represents
   *
   * Some information such as {@link SourceMetadata.size|size} or {@link SourceMetadata.eTag|eTag} can be read after the first {@link fetch}
   * other information requires {@link head|head()} to be called.
   */
  metadata?: SourceMetadata;

  /** head the source to read the Metadata and sets {@link metadata} */
  head(): Promise<SourceMetadata>;

  /** close the source, sources like files sometimes have open file handles that need to be closed */
  close?(): Promise<void>;

  /**
   * Directly read bytes from the source
   *
   * @example
   * ```typescript
   *  source.fetch(0, 1024) // load the first 1024 bytes
   *  source.fetch(1024, 20) // read 20 bytes at offset 1024
   *  source.fetch(-1024) // load the last 1024 bytes
   *```
   * @param offset Byte to start reading form
   * @param length optional number of bytes to read
   *
   * @throws {SourceError} on read failures.
   * @throws {SourceError} if the file is modified between reads.
   */
  fetch(offset: number, length?: number): Promise<ArrayBuffer>;
}

/** Metadata returned from some sources like HTTP or AWS */
export interface SourceMetadata {
  /** number of bytes of the file */
  size?: number;
  /** Entity tag */
  eTag?: string;
  contentType?: string;
  contentDisposition?: string;
  lastModified?: string;
  /** Extra metadata from the source, see individual sources to see what values are added */
  metadata?: Record<string, unknown>;
}
