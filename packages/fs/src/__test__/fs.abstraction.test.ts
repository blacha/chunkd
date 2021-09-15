import { FsFile } from '@chunkd/source-file';
import o from 'ospec';
import { FileSystemAbstraction, fsa } from '../fs.abstraction.js';

export class FakeSystem extends FsFile {
  constructor(protocol = 'fake') {
    super();
    this.protocol = protocol;
  }
}

o.spec('FileSystemAbstraction', () => {
  o('should register new file systems', () => {
    const fsaB = new FileSystemAbstraction();

    const fakeLocal = new FakeSystem('fake');
    fsaB.register('fake://', fakeLocal);
    const fakeUnknown = new FakeSystem('unknown');
    fsaB.register('', fakeUnknown);

    o(fsaB.get('fake://foo').protocol).equals('fake');
    o(fsaB.get('fake:/foo').protocol).equals('unknown');
  });

  o('should find file systems in order they were registered', () => {
    const fakeA = new FakeSystem('fake');
    const fakeB = new FakeSystem('fakeSpecific');
    const fsaB = new FileSystemAbstraction();

    fsaB.register('fake://', fakeA);
    fsaB.register('fake://some-prefix-string/', fakeB);

    o(fsaB.get('fake://foo').protocol).equals('fake');
    o(fsaB.get('fake://some-prefix-string/').protocol).equals('fakeSpecific');
    o(fsaB.get('fake://some-prefix-string/some-key').protocol).equals('fakeSpecific');
  });

  o('should order file systems by length', () => {
    const fakeA = new FakeSystem('fake');
    const fakeB = new FakeSystem('fakeSpecific');
    const fsaB = new FileSystemAbstraction();

    fsaB.register('fake://some-prefix-string/', fakeB);
    fsaB.register('fake://', fakeA);

    o(fsaB.get('fake://foo').protocol).equals('fake');
    o(fsaB.get('fake://some-prefix-string/').protocol).equals('fakeSpecific');
    o(fsaB.get('fake://some-prefix-string/some-key').protocol).equals('fakeSpecific');
  });
});
