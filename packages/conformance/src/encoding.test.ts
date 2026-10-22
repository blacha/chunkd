/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { before, describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';

import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { FileSystem } from '@chunkd/fs';
import { fsa, FsFile, FsMemory, toArray } from '@chunkd/fs';
import { FsAwsS3 } from '@chunkd/fs-aws';

// AWS SDK v3 seems to need a region set
if (process.env.AWS_REGION == null) process.env.AWS_REGION = process.env.AWS_DEFAULT_REGION ?? 'ap-southeast-2';

const Bucket = 'blacha-chunkd-test';
const Folder = 'encoding-v1/';

/** Raw (unencoded) object keys, relative to the test prefix */
const RawKeys = [
  'plain.txt',
  'with space.txt',
  'with+plus.txt',
  'with%percent.txt',
  'with%20literal-encoded-space.txt',
  'with#hash.txt',
  'with?question.txt',
  'with&ampersand.txt',
  'with=equals.txt',
  'with;semicolon.txt',
  'with:colon.txt',
  'with@at.txt',
  'with$dollar.txt',
  'with,comma.txt',
  "with'quote.txt",
  'with"doublequote.txt',
  'with(parens).txt',
  'with*star.txt',
  'with!bang.txt',
  'with~tilde.txt',
  'with[brackets].txt',
  'with{braces}.txt',
  'with<angle>.txt',
  'with|pipe.txt',
  'with^caret.txt',
  'with`backtick.txt',
  'with\\backslash.txt',
  'with\ttab.txt',
  'unicode-🦄.txt',
  'unicode-éèà.txt',
  'unicode-日本語.txt',
  'folder with space/file.txt',
  'folder#hash/file.txt',
  'folder+plus/file.txt',
  'folder%25/file.txt',
];

interface EncodingBackend {
  name: string;
  /** Folder URL (ending in "/") that all keys are written under */
  prefix: string;
  fs: FileSystem;
  /** Write a raw key to the backend */
  write: (key: string) => Promise<void>;
  cleanup: () => Promise<void>;
}

/** Encode each segment of a raw key, the way a user of fsa would to build a URL */
function encodeKey(key: string): string {
  return key.split('/').map(encodeURIComponent).join('/');
}

/** Write using fsa with a standard encoded URL */
function fsaWriter(prefix: string): (key: string) => Promise<void> {
  return async (key) => {
    await fsa.write(new URL(encodeKey(key), prefix), Buffer.from(key));
  };
}

function testEncoding(backend: EncodingBackend): void {
  describe(`encoding ${backend.name}`, () => {
    fsa.register(backend.prefix, backend.fs);

    before(async () => {
      for (const key of RawKeys) await backend.write(key);
    });

    it('should show what fsa.list returns', async () => {
      const files = await toArray(fsa.list(new URL(backend.prefix)));
      const hrefs = files.map((f) => f.href).sort();
      console.error(`\n--- ${backend.name} (${hrefs.length}) ---\n${hrefs.join('\n')}`);
      assert.equal(files.length, RawKeys.length);
    });

    for (const key of RawKeys) {
      it(`should round trip: ${JSON.stringify(key)}`, async () => {
        const files = await toArray(fsa.list(new URL(backend.prefix)));

        // Compare on the decoded path, URLs can validly differ in what they encode (eg `'` vs `%27`)
        const expectedPath = new URL(backend.prefix).pathname + key;
        const found = files.find((f) => decodeURIComponent(f.pathname) === expectedPath);
        assert.ok(
          found,
          `Missing key ${JSON.stringify(key)} expected path ${expectedPath}\nGot:\n${files.map((f) => f.href).join('\n')}`,
        );

        // The listed URL should be readable and have the content written to the raw key
        const buf = await fsa.read(found);
        assert.equal(buf.toString(), key);
      });
    }

    it('should list the same urls with recursive:false', async () => {
      const recursive = await toArray(fsa.list(new URL(backend.prefix)));
      const folders = await toArray(fsa.details(new URL(backend.prefix), { recursive: false }));
      for (const folder of folders.filter((f) => f.isDirectory)) {
        const children = await toArray(fsa.list(folder.url));
        for (const child of children) {
          assert.ok(
            recursive.find((r) => r.href === child.href),
            `${child.href} not in recursive list`,
          );
        }
      }
    });

    it('cleanup', async () => {
      await backend.cleanup();
    });
  });
}

// Memory
testEncoding({
  name: 'memory',
  prefix: `memory://blacha-chunkd-test/${Folder}`,
  fs: new FsMemory(),
  write: fsaWriter(`memory://blacha-chunkd-test/${Folder}`),
  cleanup: async () => {},
});

// Local file system
const localDir = mkdtempSync(path.join(tmpdir(), 'chunkd-encoding-'));
const localPrefix = pathToFileURL(localDir + path.sep).href;
testEncoding({
  name: 'file',
  prefix: localPrefix,
  fs: new FsFile(),
  write: fsaWriter(localPrefix),
  cleanup: async () => rmSync(localDir, { recursive: true, force: true }),
});

// S3, only if a AWS_PROFILE is set
if (process.env.AWS_PROFILE) {
  const client = new S3Client();
  testEncoding({
    name: 's3',
    prefix: `s3://${Bucket}/${Folder}`,
    fs: new FsAwsS3(client),
    // Write the raw key directly with the SDK so the key does not depend on any fsa encoding
    write: async (key) => {
      await client.send(new PutObjectCommand({ Bucket, Key: Folder + key, Body: Buffer.from(key) }));
    },
    cleanup: async () => {
      for (const key of RawKeys) await client.send(new DeleteObjectCommand({ Bucket, Key: Folder + key }));
    },
  });
}
