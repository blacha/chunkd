import { join } from 'node:path';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';
import { SourceFile } from '../index.js';

describe('SourceFile', () => {
  const TestFile = join(fileURLToPath(import.meta.url));

  let source: SourceFile;
  beforeEach(() => {
    source = new SourceFile(TestFile);
  });

  afterEach(async () => source.close());

  it('should close after reads', async () => {
    source.closeAfterRead = true;
    assert.equal(source.fd, null);

    const bytes = await source.fetch(0, 1);
    assert.equal(bytes.byteLength, 1);
    assert.equal(source.fd, null);

    const bytesB = await source.fetch(10, 1);
    assert.equal(bytesB.byteLength, 1);
    assert.equal(source.fd, null);
  });

  it('should resolve uri', () => {
    assert.equal(source.url.protocol, 'file:');
    assert.equal(source.url.pathname.endsWith('/source.file.test.js'), true);
  });

  it('should read last bytes from file', async () => {
    const buf = Buffer.from(await source.fetch(-1024));

    const metadata = await source.metadata;
    const bytes = await source.fetch((metadata?.size ?? -1) - 1024, 1024);
    const expected = Buffer.from(bytes);

    assert.equal(buf.toString('base64'), expected.toString('base64'));
  });
});
