import { FsFile } from '@chunkd/source-file';
import o from 'ospec';
import { FileSystemAbstraction } from '../fs.abstraction.js';

export class FakeSystem extends FsFile {
  constructor(protocol = 'fake') {
    super();
    this.protocol = protocol;
  }
}

o.spec('FileSystemAbstraction', () => {
  o('should find file systems', () => {
    const fsa = new FileSystemAbstraction();

    o(fsa.get('/foo').protocol).equals('file');
    o(fsa.get('/').protocol).equals('file');
    o(fsa.get('./').protocol).equals('file');
  });

  o('should register new file systems', () => {
    const fsa = new FileSystemAbstraction();

    const fakeLocal = new FakeSystem('fake');
    fsa.register('fake://', fakeLocal);

    o(fsa.get('/').protocol).equals('file');
    o(fsa.get('//').protocol).equals('file');

    o(fsa.get('fake://foo').protocol).equals('fake');
    o(fsa.get('fake:/foo').protocol).equals('file');
    o(fsa.get('fake//foo').protocol).equals('file');
    o(fsa.get('fake').protocol).equals('file');
  });

  o('should find file systems in order they were registered', () => {
    const fakeA = new FakeSystem('fake');
    const fakeB = new FakeSystem('fakeSpecific');
    const fsa = new FileSystemAbstraction();

    fsa.register('fake://', fakeA);
    fsa.register('fake://some-prefix-string/', fakeB);

    o(fsa.get('fake://foo').protocol).equals('fake');
    o(fsa.get('fake://some-prefix-string/').protocol).equals('fakeSpecific');
    o(fsa.get('fake://some-prefix-string/some-key').protocol).equals('fakeSpecific');
  });

  o('should order file systems by length', () => {
    const fakeA = new FakeSystem('fake');
    const fakeB = new FakeSystem('fakeSpecific');
    const fsa = new FileSystemAbstraction();

    fsa.register('fake://some-prefix-string/', fakeB);
    fsa.register('fake://', fakeA);

    o(fsa.get('fake://foo').protocol).equals('fake');
    o(fsa.get('fake://some-prefix-string/').protocol).equals('fakeSpecific');
    o(fsa.get('fake://some-prefix-string/some-key').protocol).equals('fakeSpecific');
  });
});
