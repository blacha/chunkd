export { Source, SourceMetadata } from './source.js';
export { ContentRange } from './range.js';

export function tryParseUrl(s: string): URL | null {
  try {
    return new URL(s);
  } catch (e) {
    return null;
  }
}
