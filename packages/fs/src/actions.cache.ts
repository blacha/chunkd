import { createHash } from 'crypto';
import { FileSystemActions } from './actions';

export function createCache(target: string): FileSystemActions {
  return {
    before(fsa, req) {
      if (req.type !== 'read') return;
      if (req.path.startsWith(target)) return;

      const pathHash = createHash('sha256').update(req.path).digest('base64url');

      return fsa
        .read(fsa.join(target, pathHash))
        .then((data) => {
          console.log('CacheHit', req.path);
          return { type: 'read' as const, data, cacheHit: true };
        })
        .catch(() => null); // Ignore failing to read
    },
    after(fsa, req, res) {
      if (req.type !== 'read' || res.type !== 'read') return;
      if (req.path.startsWith(target)) return;
      const pathHash = createHash('sha256').update(req.path).digest('base64url');

      // This was read from the cache no need to re-write it back
      if ('cacheHit' in res) return;

      return fsa.write(fsa.join(target, pathHash), res.data).then(() => null);
    },
  } as FileSystemActions;
}
