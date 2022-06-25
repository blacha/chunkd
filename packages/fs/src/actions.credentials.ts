import { CompositeError, FileSystem } from '@chunkd/core';
import { FileSystemActions } from './actions';

function isForbidden(e: Error): boolean {
  if (!('code' in e)) return false;
  if ((e as CompositeError).code !== 403) return false;
  return true;
}

export function createFsProvider(cb: (path: string) => Promise<FileSystem | null>, prefix?: string): FileSystemActions {
  return {
    error(fsa, req, err) {
      if (prefix && !req.path.startsWith(prefix)) return;
      if (!isForbidden(err)) return;
      console.log('Forbidden', req.path);

      return cb(req.path).then((fs) => {
        if (fs == null) return null;
        return;
      });
    },
  } as FileSystemActions;
}
