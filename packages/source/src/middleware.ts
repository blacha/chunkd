import { Source } from './source.js';

export interface SourceRequest {
  source: Source;
  offset: number;
  length: number | undefined;
}
export type SourceCallback = (req: SourceRequest) => Promise<ArrayBuffer>;

export interface SourceMiddleware {
  name: string;
  fetch(req: SourceRequest, next: SourceCallback): Promise<ArrayBuffer>;
}
