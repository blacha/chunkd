export { SourceError } from './error.js';
export { SourceCallback, SourceMiddleware, SourceRequest } from './middleware.js';
export { ContentRange } from './range.js';
export { Source, SourceMetadata } from './source.js';
export { SourceView } from './view.js';

export function tryParseUrl(s: string): URL | null {
  try {
    return new URL(s);
  } catch (e) {
    return null;
  }
}
