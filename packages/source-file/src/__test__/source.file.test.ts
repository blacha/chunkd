/* eslint-disable @typescript-eslint/no-non-null-assertion */
import o from 'ospec';
import 'source-map-support/register';
import { SourceFile } from '../index';
import { basename, join } from 'path';

o.spec('SourceFile', () => {
  const TestFile = join(__dirname, 'source.file.test.js');

  let source: SourceFile;
  o.beforeEach(() => {
    source = new SourceFile(TestFile);
  });
  o.afterEach(async () => source.close());

  o('should close after reads', async () => {
    source.closeAfterRead = true;
    o(source.fd).equals(null);

    const bytes = await source.fetchBytes(0, 1);
    o(bytes.byteLength).equals(1);
    o(source.fd).equals(null);

    const bytesB = await source.fetchBytes(10, 1);
    o(bytesB.byteLength).equals(1);
    o(source.fd).equals(null);
  });

  o('should resolve uri', () => {
    o(source.uri[0]).equals('/');
    o(source.name).equals(basename(__filename));
  });

  o('should read last bytes from file', async () => {
    const buf = Buffer.from(await source.fetchBytes(-1024));

    const size = await source.size;
    await source.loadBytes(size - 1024, 1024);
    const expected = Buffer.from(source.bytes(size - 1024, 1024));

    o(buf.toString('base64')).equals(expected.toString('base64'));
  });
});
