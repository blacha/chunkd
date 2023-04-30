import { Source } from '@chunkd/source';

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
