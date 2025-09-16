import assert from 'node:assert';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { platform } from 'node:os';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { FsError } from '../../error.js';
import { fsa } from '../../file.system.abstraction.js';
import { FsFile } from '../file.js';

async function toArray<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const output: T[] = [];
  for await (const o of generator) output.push(o);
  return output;
}

function isWindows(): boolean {
  return platform() === 'win32';
}

describe('LocalFileSystem', () => {
  const fs = new FsFile();

  beforeEach(async () => {
    await mkdir('./.test/', { recursive: true });
    await writeFile('./.test/test.txt', 'Hello World');
  });

  afterEach(async () => {
    await rm('./.test/', { recursive: true });
  });

  it('should read a file', async () => {
    const buf = await fs.read(fsa.toUrl('.test/test.txt'));
    assert.equal(buf.toString().includes('Hello World'), true);
  });

  it('should stream a file', async () => {
    const buf = fs.readStream(fsa.toUrl('.test/test.txt'));

    const targetFile = fsa.toUrl('.test/test-target.txt');
    await fs.write(targetFile, buf);

    const after = await fs.read(targetFile);
    assert.equal(after.toString().includes('Hello World'), true);

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

  it('should head a file with details', async () => {
    const ref = await fs.head(fsa.toUrl('./.test/test.txt'));

    // response objects should be hidden
    assert.ok(!JSON.stringify(ref).includes('$response'));
    assert.ok(ref?.$response?.atime);
  });

  it('should head/exists a file', async () => {
    const ref = await fs.head(fsa.toUrl('./.test/test.txt'));
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
      files.find((f) => f.href.includes('__test__/file.test.')),
      undefined,
    );
  });

  it('should list files with details', async () => {
    const files = await toArray(fs.details(new URL('.', import.meta.url)));

    assert.equal(files.length > 3, true);
    assert.notEqual(
      files.find((f) => f.url.href.includes('__test__/file.test.')),
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
      files.find((f) => f.url.href.includes('__test__/file.test.')),
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
      files.find((f) => f.url.href.endsWith('__test__/file.test.')),
      undefined,
    );
    assert.deepEqual(files.filter((f) => f.isDirectory).length, 1);
  });

  it('should read and write special characters files', async () => {
    const badChars = ['#', '?', '@', '=', '+', '$', ',', ';', ':'];
    if (isWindows()) {
      badChars.splice(badChars.indexOf('?'), 1);
      badChars.splice(badChars.indexOf(':'), 1);
    }
    const allChars = badChars.join(',');
    const foundChars = new Set(badChars);
    foundChars.add(allChars);

    await mkdir('./.test/special/', { recursive: true });
    const basePath = fileURLToPath(pathToFileURL('./.test/special/'));
    try {
      await Promise.all(
        badChars.map(async (c) => {
          await writeFile(`./.test/special/${c}_example.txt`, Buffer.from(c));
        }),
      );
      await writeFile(`./.test/special/${allChars}.txt`, Buffer.from(allChars));

      // List all the files then validate that they have all been found and read
      const fsFiles = await fsa.toArray(fs.list(fsa.toUrl('./.test/special/')));

      for (const f of fsFiles) {
        const bytes = String(await fs.read(f));
        assert.ok(foundChars.has(bytes), `Missing char: ${bytes}`);
        foundChars.delete(bytes);
      }

      assert.equal(foundChars.size, 0);

      const fileNames = fsFiles.map((m) => fileURLToPath(m).slice(basePath.length));
      assert.deepEqual(
        fileNames,
        [
          `${allChars}.txt`,
          '#_example.txt',
          '$_example.txt',
          '+_example.txt',
          ',_example.txt',
          // Windows tests fail with ":"
          isWindows() ? undefined : ':_example.txt',
          ';_example.txt',
          '=_example.txt',
          // Windows tests fail with "?"
          isWindows() ? undefined : '?_example.txt',
          '@_example.txt',
        ].filter(Boolean),
      );
    } finally {
      await rm('./.test/special', { recursive: true });
    }
  });
});
