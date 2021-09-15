export { ByteSize } from './bytes.js';
export { ChunkSourceBase } from './chunk.source.js';
export { LogType } from './log.js';
export { SourceMemory } from './chunk.source.memory.js';
export { ChunkSource } from './source.js';
export { ErrorCodes, CompositeError } from './composite.js';
export { FileSystem, FileInfo } from './fs.js';

export function isRecord<T = unknown>(value: unknown): value is Record<string, T> {
  return typeof value === 'object' && value !== null;
}
