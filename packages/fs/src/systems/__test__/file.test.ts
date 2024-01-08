/* eslint-disable @typescript-eslint/no-non-null-assertion */
import assert from 'node:assert';
import { describe, it } from 'node:test';

import { FsError } from '../../error.js';
import { FsFile } from '../file.js';

async function toArray<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const output: T[] = [];
  for await (const o of generator) output.push(o);
  return output;
}

describe('LocalFileSystem', () => {
  const fs = new FsFile();

  it('should read a file', async () => {
    const buf = await fs.read(new URL('file.test.js', import.meta.url));
    assert.equal(buf.toString().includes("import o from 'ospec'"), true);
  });

  it('should stream a file', async () => {
    const buf = fs.readStream(new URL('file.test.js', import.meta.url));

    const targetFile = new URL('.file.test.js', import.meta.url);
    await fs.write(targetFile, buf);

    const after = await fs.read(targetFile);
    assert.equal(after.toString().includes("import o from 'ospec'"), true);

    await fs.delete(targetFile);
  });

  it('should not error on delete when 404', async () => {
    await fs.delete(new URL('to.delete', import.meta.url));
    assert.ok('Ok');
  });

  it('should delete a file', async () => {
    const toDelete = new URL('to.delete', import.meta.url);
    assert.equal(await fs.head(toDelete), null);
    await fs.write(toDelete, Buffer.from('TO_DELETE'));
    assert.notEqual(await fs.head(toDelete), null);

    await fs.delete(toDelete);
    assert.equal(await fs.head(toDelete), null);
  });

  it('should 404 when file not found', async () => {
    try {
      await fs.read(new URL('NOT A FILE.js', import.meta.url));
      assert.fail('should throw'); // should have errored
    } catch (e: unknown) {
      assert.equal(FsError.is(e), true);
      assert.equal((e as FsError).code, 404);
      assert.equal((e as FsError).url.href, new URL('NOT A FILE.js', import.meta.url).href);
      assert.equal((e as FsError).action, 'read');
    }
  });

  it('should throw when writing from a bad stream', async () => {
    try {
      await fs.write(
        new URL('fs.test', import.meta.url),
        fs.readStream(new URL('missing-file-goes-here.txt', import.meta.url)),
      );
      assert.fail('should throw');
    } catch (e: unknown) {
      assert.equal((e as { code: number }).code, 404);
      assert.equal(String(e), 'Error: Failed to write: ' + new URL('fs.test', import.meta.url).href);
    }
  });

  it('should head/exists a file', async () => {
    const ref = await fs.head(new URL('file.test.js', import.meta.url));
    assert.notEqual(ref, null);
  });

  it('should ensure "/" is added to folders', async () => {
    const href = new URL('.', import.meta.url).href;
    const missingTrailing = new URL(href.slice(0, href.length - 1));
    const files = await toArray(fs.list(missingTrailing));

    assert.equal(files.length > 2, true);
    assert.ok(files.every((f) => f.href.includes('src/systems/__test__/')));
  });

  it('should list files', async () => {
    const files = await toArray(fs.list(new URL('.', import.meta.url)));

    assert.equal(files.length > 2, true);
    assert.notEqual(
      files.find((f) => f.href.endsWith('__test__/file.test.js')),
      undefined,
    );
  });

  it('should list files with details', async () => {
    const files = await toArray(fs.details(new URL('.', import.meta.url)));

    assert.equal(files.length > 3, true);
    assert.notEqual(
      files.find((f) => f.url.href.endsWith('__test__/file.test.js')),
      undefined,
    );
    assert.deepEqual(
      files.filter((f) => f.isDirectory),
      [],
    );
  });

  it('should list recursively', async () => {
    const files = await toArray(fs.details(new URL('..', import.meta.url)));
    assert.notEqual(
      files.find((f) => f.url.href.endsWith('__test__/file.test.js')),
      undefined,
    );
    assert.deepEqual(
      files.filter((f) => f.isDirectory),
      [],
    );
  });

  it('should list folders when not recursive', async () => {
    const files = await toArray(fs.details(new URL('..', import.meta.url), { recursive: false }));
    // In a sub folder shouldn't find it
    assert.equal(
      files.find((f) => f.url.href.endsWith('__test__/file.test.js')),
      undefined,
    );
    assert.deepEqual(files.filter((f) => f.isDirectory).length, 1);
  });
});
