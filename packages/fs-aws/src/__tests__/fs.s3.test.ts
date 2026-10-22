import assert from 'node:assert';
import { describe, it } from 'node:test';

import type { S3Client } from '@aws-sdk/client-s3';
import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { toArray } from '@chunkd/fs';

import { FsAwsS3 } from '../fs.s3.js';

/** S3 `EncodingType: 'url'` encoding */
function s3UrlEncode(key: string): string {
  return encodeURIComponent(key).replace(/%2F/g, '/').replace(/%20/g, '+');
}

/** Minimal S3 mock */
class FakeS3 {
  files = new Map<string, Buffer>();
  listRequests: Record<string, unknown>[] = [];

  constructor(keys: string[]) {
    for (const key of keys) this.files.set(key, Buffer.from(key));
  }

  send(cmd: unknown): Promise<unknown> {
    if (cmd instanceof ListObjectsV2Command) {
      const input = cmd.input;
      this.listRequests.push({ ...input });
      const encode = input.EncodingType === 'url' ? s3UrlEncode : (s: string): string => s;
      const prefix = input.Prefix ?? '';
      const contents: { Key: string; Size: number }[] = [];
      const prefixes = new Set<string>();
      for (const [key, buf] of this.files) {
        if (!key.startsWith(prefix)) continue;
        const delimIndex = input.Delimiter ? key.indexOf(input.Delimiter, prefix.length) : -1;
        if (delimIndex > -1) prefixes.add(key.slice(0, delimIndex + 1));
        else contents.push({ Key: encode(key), Size: buf.length });
      }
      return Promise.resolve({
        IsTruncated: false,
        Contents: contents,
        CommonPrefixes: [...prefixes].map((p) => ({ Prefix: encode(p) })),
      });
    }
    if (cmd instanceof GetObjectCommand) {
      const buf = this.files.get(cmd.input.Key ?? '');
      if (buf == null) return Promise.reject({ $metadata: { httpStatusCode: 404 } });
      return Promise.resolve({ Body: buf, ContentLength: buf.length });
    }
    return Promise.reject(new Error('Unsupported command'));
  }
}

const Keys = [
  '3. Processed (including calibrations)/Feature Layers/a b.tiff',
  'plus/a+b.tiff',
  'plus/a + b.tiff',
  'percent/100%.tiff',
  'percent/a%20b.tiff',
  'special/a#b?c.tiff',
  'special/tab\t.tiff',
  'special/trailing ',
  'unicode/Ōtautahi tē.tiff',
];

function toKey(url: URL): string {
  return decodeURIComponent(url.pathname.slice(1));
}

describe('FsAwsS3.list', () => {
  it('should list urls that round trip to the original key', async () => {
    const s3 = new FakeS3(Keys);
    const fs = new FsAwsS3(s3 as unknown as S3Client);

    const urls = await toArray(fs.list(new URL('s3://bucket/')));
    assert.deepStrictEqual(urls.map(toKey).sort(), [...Keys].sort());

    for (const url of urls) {
      const buf = await fs.read(url);
      assert.strictEqual(buf.toString(), toKey(url));
    }

    const details = await toArray(fs.details(new URL('s3://bucket/')));
    assert.deepStrictEqual(details.map((f) => f.$response?.Key ?? '').sort(), [...Keys].sort());
  });

  it('should list urls matching a url created from the same path', async () => {
    const s3 = new FakeS3(Keys);
    const fs = new FsAwsS3(s3 as unknown as S3Client);

    const root = new URL('s3://bucket/3. Processed (including calibrations)/');
    const urls = await toArray(fs.list(root));
    assert.deepStrictEqual(
      urls.map((u) => u.href),
      ['s3://bucket/3.%20Processed%20(including%20calibrations)/Feature%20Layers/a%20b.tiff'],
    );
    assert.ok(urls[0]?.href.startsWith(root.href));
    assert.strictEqual(s3.listRequests[0]?.Prefix, '3. Processed (including calibrations)/');
  });

  it('should list folders that round trip to the original prefix', async () => {
    const s3 = new FakeS3(Keys);
    const fs = new FsAwsS3(s3 as unknown as S3Client);

    const folders = await toArray(fs.details(new URL('s3://bucket/'), { recursive: false }));
    assert.ok(folders.every((f) => f.isDirectory));
    const root = folders.find((f) => toKey(f.url).startsWith('3.'));
    assert.strictEqual(root?.url.href, 's3://bucket/3.%20Processed%20(including%20calibrations)/');

    for (const folder of folders) {
      const files = await toArray(fs.list(folder.url));
      assert.ok(files.length > 0, `No files found in ${folder.url.href}`);
      assert.strictEqual(s3.listRequests.at(-1)?.Prefix, toKey(folder.url));
    }
  });

  it('should send prefixes containing "+" unchanged', async () => {
    const s3 = new FakeS3(Keys);
    const fs = new FsAwsS3(s3 as unknown as S3Client);

    const urls = await toArray(fs.list(new URL('s3://bucket/plus/a+b')));
    assert.strictEqual(s3.listRequests[0]?.Prefix, 'plus/a+b');
    assert.deepStrictEqual(urls.map(toKey), ['plus/a+b.tiff']);
  });
});
