import { SourceMiddleware, SourceRequest, SourceCallback } from '../type.js';

/** convert negative  offset requests into absolute requests if the file size is known */
export const SourceAbsolute: SourceMiddleware = {
  name: 'source:absolute',
  fetch(req: SourceRequest, next: SourceCallback): Promise<ArrayBuffer> {
    // Not reading from the end, middleware is not needed
    if (req.offset > 0) return next(req);

    const size = req.source.metadata?.size ?? -1;
    if (size < 0) return next(req); // Metadata hasn't been fetched yet
    return next({ ...req, offset: size + req.offset, length: Math.abs(req.offset) });
  },
};
