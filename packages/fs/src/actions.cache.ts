import { createHash } from 'crypto';
import { FileSystemActions } from './actions';

export function createCache(prefix: string): FileSystemActions {
  return {
    before(fsa, req) {
      if (req.type !== 'read') return;
      if (req.path.startsWith(prefix)) return;

      const pathHash = createHash('sha256').update(req.path).digest('base64url');
      const pathPrefix = pathHash.slice(0, 2);

      return fsa
        .read(fsa.joinAll(prefix, pathPrefix, pathHash))
        .then((data) => {
          return { ...req, data, cacheHit: true };
        })
        .catch(() => null); // Ignore failing to read
    },
    after(fsa, req, res) {
      if (req.type !== 'read' || res.type !== 'read') return;
      if (req.path.startsWith(prefix)) return;
      const pathHash = createHash('sha256').update(req.path).digest('base64url');
      const pathPrefix = pathHash.slice(0, 2);

      // This was read from the cache no need to write it back
      if ('cacheHit' in res) return;

      return fsa.write(fsa.joinAll(prefix, pathPrefix, pathHash), res.data).then(() => null);
    },
  } as FileSystemActions;
}
