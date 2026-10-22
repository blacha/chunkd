/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from 'node:assert';
import { before, describe, it } from 'node:test';

import { fsa, toArray } from '@chunkd/fs';

import type { TestBackend } from './backends.js';
import { getWritableBackends } from './backends.js';

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

/** Encode each segment of a raw key, the way a user of fsa would to build a URL */
function encodeKey(key: string): string {
  return key.split('/').map(encodeURIComponent).join('/');
}

function testEncoding(backend: TestBackend): void {
  const prefix = backend.prefix;
  describe(`encoding ${backend.name}`, () => {
    fsa.register(backend.prefix, backend.fs);

    let files: URL[] = [];

    before(async () => {
      for (const key of RawKeys) await fsa.write(new URL(encodeKey(key), prefix), Buffer.from(key));
      files = await toArray(fsa.list(new URL(backend.prefix)));
    });

    it('should show what fsa.list returns', () => {
      const hrefs = files.map((f) => f.href).sort();
      console.error(`\n--- ${backend.name} (${hrefs.length}) ---\n${hrefs.join('\n')}`);
      assert.equal(files.length, RawKeys.length);
    });

    for (const key of RawKeys) {
      it(`should round trip: ${JSON.stringify(key)}`, async () => {
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
      for (const key of RawKeys) await fsa.delete(new URL(encodeKey(key), prefix));
    });
  });
}

// memory, file and s3 (only if a AWS_PROFILE is set)
for (const backend of getWritableBackends(Folder)) testEncoding(backend);
