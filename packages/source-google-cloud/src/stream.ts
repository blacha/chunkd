import { CompositeError, isRecord } from '@chunkd/core';
import { Readable } from 'stream';

export function getCompositeError(e: unknown, msg: string): CompositeError {
  if (!isRecord(e)) return new CompositeError(msg, 500, e);
  if (typeof e.statusCode !== 'number') return new CompositeError(msg, 500, e);
  return new CompositeError(msg, e.statusCode, e);
}

export function toReadable(r: string | Buffer | Readable): Readable {
  if (typeof r === 'string') r = Buffer.from(r);
  return Readable.from(r);
}

export async function toBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const buf: Buffer[] = [];

    stream.on('data', (chunk) => buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(buf)));
    stream.on('error', (err) => reject(`error converting stream - ${err}`));
  });
}
