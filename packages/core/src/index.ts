export { ByteSize } from './bytes.js';
export { ChunkSourceBase } from './chunk.source.js';
export { SourceMemory } from './chunk.source.memory.js';
export { ChunkSource, ChunkSourceMetadata } from './source.js';
export { ErrorCodes, CompositeError } from './composite.js';
export { FileSystem, FileInfo, WriteOptions, ListOptions } from './fs.js';
export { FileSystemProvider } from './provider.js';

export function isRecord<T = unknown>(value: unknown): value is Record<string, T> {
  return typeof value === 'object' && value !== null;
}

/**
 * Parse a s3/google storage URI into a bucket and key if the key exists
 *
 * @example
 * ```typescript
 * parseUri('s3://bucket-name') // { bucket: 'bucket-name', protocol: 's3' }
 * parseUri('gs://bucket-name') // { bucket: 'bucket-name', protocol: 'gs' }
 * ```
 */
export function parseUri(uri: string): { protocol: string; bucket: string; key?: string } | null {
  const parts = uri.split('/');

  let protocol = parts[0];
  if (protocol == null || protocol === '') return null;
  if (protocol.endsWith(':')) protocol = protocol.slice(0, protocol.length - 1);

  const bucket = parts[2];
  if (bucket == null || bucket.trim() === '') return null;
  if (parts.length === 3) return { protocol, bucket };

  const key = parts.slice(3).join('/');
  if (key == null || key.trim() === '') return { protocol, bucket };
  return { key, bucket, protocol };
}

const endsWithSlash = /\/$/;
const startsWithSlash = /^\//;
/** path.join removes slashes, s3:// => s3:/ which causes issues */
export function joinUri(filePathA: string, filePathB: string): string {
  return filePathA.replace(endsWithSlash, '') + '/' + filePathB.replace(startsWithSlash, '');
}

export function joinAllUri(filePathA: string, ...filePaths: string[]): string {
  let output = filePathA;
  for (let i = 0; i < filePaths.length; i++) output = joinUri(output, filePaths[i]);
  return output;
}

/** Utility to convert async generators into arrays */
export async function toArray<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const output: T[] = [];
  for await (const o of generator) output.push(o);
  return output;
}
