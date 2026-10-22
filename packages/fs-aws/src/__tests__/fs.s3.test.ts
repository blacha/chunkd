import assert from 'node:assert';
import { describe, it } from 'node:test';

import type { S3Client } from '@aws-sdk/client-s3';
import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { toArray } from '@chunkd/fs';

import { FsAwsS3 } from '../fs.s3.js';

const Keys = [
  '3. Processed (including calibrations)/Feature Layers/a b.tiff',
  'plus/a+b.tiff',
  'plus/a + b.tiff',
  'percent/100%.tiff',
  'percent/a%20b.tiff',
  'special/a#b?c.tiff',
  'special/tab\t.tiff',
  'special/trailing ',
  '🦄/Ōtautahi 🦄+🌈.tiff',
];

/** S3 `EncodingType: 'url'` encoding */
function s3UrlEncode(key: string): string {
  return encodeURIComponent(key).replace(/%2F/g, '/').replace(/%20/g, '+');
}

/** Minimal S3 mock */
const s3 = {
  async send(cmd: unknown): Promise<unknown> {
    if (cmd instanceof GetObjectCommand) {
      const key = cmd.input.Key ?? '';
      if (!Keys.includes(key)) throw new Error(`NoSuchKey: ${key}`);
      return { Body: Buffer.from(key) };
    }
    if (!(cmd instanceof ListObjectsV2Command)) throw new Error('Unsupported command');

    const { Prefix = '', Delimiter, EncodingType } = cmd.input;
    const encode = (s: string): string => (EncodingType === 'url' ? s3UrlEncode(s) : s);
    const contents: { Key: string }[] = [];
    const prefixes = new Set<string>();
    for (const key of Keys.filter((k) => k.startsWith(Prefix))) {
      const end = Delimiter ? key.indexOf(Delimiter, Prefix.length) : -1;
      if (end === -1) contents.push({ Key: encode(key) });
      else prefixes.add(encode(key.slice(0, end + 1)));
    }
    return { Contents: contents, CommonPrefixes: [...prefixes].map((p) => ({ Prefix: p })) };
  },
} as unknown as S3Client;

function toKey(url: URL): string {
  return decodeURIComponent(url.pathname.slice(1));
}

describe('FsAwsS3.list', () => {
  const fs = new FsAwsS3(s3);

  it('should list files that round trip to their key', async () => {
    const files = await toArray(fs.details(new URL('s3://bucket/')));
    assert.deepStrictEqual(
      files.map((f) => toKey(f.url)),
      Keys,
    );
    assert.deepStrictEqual(
      files.map((f) => f.$response?.Key),
      Keys,
    );
    for (const f of files) assert.strictEqual((await fs.read(f.url)).toString(), toKey(f.url));
  });

  it('should list folders matching urls created from their path', async () => {
    const folders = await toArray(fs.list(new URL('s3://bucket/'), { recursive: false }));
    const paths = [...new Set(Keys.map((k) => k.slice(0, k.indexOf('/') + 1)))];
    assert.deepStrictEqual(
      folders.map((f) => f.href),
      paths.map((p) => new URL(`s3://bucket/${p}`).href),
    );
  });

  it('should list files by prefix', async () => {
    for (const prefix of ['3. Processed (', 'plus/a+', '🦄/Ōtautahi 🦄+']) {
      const root = new URL(`s3://bucket/${prefix}`);
      const urls = await toArray(fs.list(root));
      assert.deepStrictEqual(
        urls.map(toKey),
        Keys.filter((k) => k.startsWith(prefix)),
      );
      assert.ok(urls.length > 0 && urls.every((u) => u.href.startsWith(root.href)), root.href);
    }
  });
});
