import assert from 'node:assert';
import { join } from 'node:path';
import { beforeEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { SourceFile } from '../index.js';

describe('SourceFile', () => {
  const TestFile = join(fileURLToPath(import.meta.url));

  let source: SourceFile;
  beforeEach(() => {
    source = new SourceFile(TestFile);
  });

  it('should resolve uri', () => {
    assert.equal(source.url.protocol, 'file:');
    assert.equal(source.url.pathname.endsWith('/source.file.test.js'), true);
  });

  it('should read last bytes from file', async () => {
    const buf = Buffer.from(await source.fetch(-128));

    const metadata = await source.head();
    const bytes = await source.fetch(metadata.size - 128, 128);
    const expected = Buffer.from(bytes);

    assert.equal(buf.toString('base64'), expected.toString('base64'));
  });
});
