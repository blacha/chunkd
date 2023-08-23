export const ContentRange = {
  /** Convert a offset/length to a range request
   *
   * @example
   * ```typescript
   * ContentRange.toRange(10) // "bytes=10"
   * ContentRange.toRange(0, 1024) // "bytes=0-1023"
   * ```
   */
  toRange(offset: number, length?: number): string {
    if (length == null) return `bytes=${offset}`;
    if (offset < 0) throw new Error('Cannot read from remote source with negative offset and length');
    return `bytes=${offset}-${offset + length - 1}`;
  },

  /**
   * Parse a Content-Range header to extract the size of the source
   *
   * @example
   * ```typescript
   * ContentRange.parseRange("bytes 200-1000/67589"); // 67589
   * ```
   * @throws if range is not a Content-Range with size
   */
  parseSize(range: string): number {
    const [unit, chunks] = range.split(' ');
    if (unit !== 'bytes') throw new Error('Failed to parse content-range: ' + range);
    if (chunks == null) throw new Error('Failed to parse content-range: ' + range);
    const [, size] = chunks.split('/');
    const result = Number(size);
    if (isNaN(result)) throw new Error('Failed to parse content-range: ' + range);
    return result;
  },
};
