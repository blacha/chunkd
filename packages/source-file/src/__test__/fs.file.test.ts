/* eslint-disable @typescript-eslint/no-non-null-assertion */
import o from 'ospec';
import path from 'path';
import 'source-map-support/register.js';
import { fileURLToPath } from 'url';
import { FsFile } from '../file.fs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function toArray<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const output: T[] = [];
  for await (const o of generator) output.push(o);
  return output;
}

o.spec('LocalFileSystem', () => {
  const fs = new FsFile();

  o('should read a file', async () => {
    const buf = await fs.read(path.join(__dirname, 'fs.file.test.js'));
    o(buf.toString().includes("import o from 'ospec'")).equals(true);
  });

  o('should 404 when file not found', async () => {
    try {
      await fs.read(path.join(__dirname, 'NOT A FILE.js'));
      o(true).equals(false); // should have errored
    } catch (e: any) {
      o(e.code).equals(404);
    }
  });

  o('should head/exists a file', async () => {
    const ref = await fs.head(path.join(__dirname, 'fs.file.test.js'));
    o(ref).notEquals(null);
  });

  o('should list files', async () => {
    const files = await toArray(fs.list(__dirname));

    o(files.length > 3).equals(true);
    o(files.find((f) => f.endsWith('__test__/fs.file.test.js'))).notEquals(undefined);
  });

  o('should list files with details', async () => {
    const files = await toArray(fs.details(__dirname));

    o(files.length > 3).equals(true);
    o(files.find((f) => f.path.endsWith('__test__/fs.file.test.js'))).notEquals(undefined);
    o(files.filter((f) => f.isDirectory)).deepEquals([]);
  });

  o('should list recursively', async () => {
    const files = await toArray(fs.details(path.join(__dirname, '..')));
    o(files.find((f) => f.path.endsWith('__test__/fs.file.test.js'))).notEquals(undefined);
    o(files.filter((f) => f.isDirectory)).deepEquals([]);
  });

  o('should list folders when not recursive', async () => {
    const files = await toArray(fs.details(path.join(__dirname, '..'), { recursive: false }));
    // In a sub folder shouldn't find it
    o(files.find((f) => f.path.endsWith('__test__/fs.file.test.js'))).equals(undefined);
    o(files.filter((f) => f.isDirectory).length).deepEquals(1);
  });
});
