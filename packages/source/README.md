# @chunkd/source

Base interface for all sources used by `@chunkd`

````typescript
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

  /** Metadata about the object the source represents */
  metadata?: SourceMetadata;

  /** Read the metadata before a fetch request */
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
   */
  fetch(offset: number, length?: number): Promise<ArrayBuffer>;
}
````

## Examples

Example sources

- [Memory](https://www.npmjs.com/package/@chunkd/source-memory)
- [File](https://www.npmjs.com/package/@chunkd/source-file)
- [AWS](https://www.npmjs.com/package/@chunkd/source-aws)
- [Http](https://www.npmjs.com/package/@chunkd/source-http)
