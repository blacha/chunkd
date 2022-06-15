import { FsFile } from '@chunkd/source-file';
import o from 'ospec';
import Sinon from 'sinon';
import { FileSystemAbstraction } from '../fs.abstraction.js';

export class FakeSystem extends FsFile {
  constructor(protocol = 'fake') {
    super();
    this.protocol = protocol;
  }
}

o.spec('FileSystemAbstraction', () => {
  o('should register new file systems', () => {
    const fsa = new FileSystemAbstraction();

    const fakeLocal = new FakeSystem('fake');
    fsa.register('fake://', fakeLocal);
    const fakeUnknown = new FakeSystem('unknown');
    fsa.register('', fakeUnknown);

    o(fsa.get('fake://foo', 'r').protocol).equals('fake');
    o(fsa.get('fake:/foo', 'r').protocol).equals('unknown');
  });

  o('should register filesystems as rw', () => {
    const fsa = new FileSystemAbstraction();

    const fakeLocal = new FakeSystem('fake');
    fsa.register('fake://', fakeLocal);
    o(fsa.get('fake://foo', 'rw').protocol).equals('fake');
  });

  o('should not return a read only filesystem when wanting to write', () => {
    const fsa = new FileSystemAbstraction();

    const fakeLocal = new FakeSystem('fake');
    fsa.register('fake://', fakeLocal, 'r');
    o(() => fsa.get('fake://foo', 'rw')).throws(Error);
  });

  o('should allow read and read-write file systems to be registered', () => {
    const fsa = new FileSystemAbstraction();

    const fakeR = new FakeSystem('r');
    const fakeRw = new FakeSystem('rw');

    fsa.register('fake://', fakeR, 'r');
    fsa.register('fake://', fakeRw, 'rw');
    o(fsa.get('fake://foo', 'rw').protocol).equals('rw');
  });

  o('should find file systems in order they were registered', () => {
    const fakeA = new FakeSystem('fake');
    const fakeB = new FakeSystem('fakeSpecific');
    const fsa = new FileSystemAbstraction();

    fsa.register('fake://', fakeA);
    fsa.register('fake://some-prefix-string/', fakeB);

    o(fsa.get('fake://foo', 'r').protocol).equals('fake');
    o(fsa.get('fake://some-prefix-string/', 'r').protocol).equals('fakeSpecific');
    o(fsa.get('fake://some-prefix-string/some-key', 'r').protocol).equals('fakeSpecific');
  });

  o('should order file systems by length', () => {
    const fakeA = new FakeSystem('fake');
    const fakeB = new FakeSystem('fakeSpecific');
    const fsa = new FileSystemAbstraction();

    fsa.register('fake://some-prefix-string/', fakeB);
    fsa.register('fake://', fakeA);

    o(fsa.get('fake://foo', 'r').protocol).equals('fake');
    o(fsa.get('fake://some-prefix-string/', 'r').protocol).equals('fakeSpecific');
    o(fsa.get('fake://some-prefix-string/some-key', 'r').protocol).equals('fakeSpecific');
  });

  o('should replace file systems when registering duplicates', () => {
    const fakeA = new FakeSystem('fake');
    const fakeB = new FakeSystem('fakeSpecific');
    const fsa = new FileSystemAbstraction();

    fsa.register('fake://', fakeA);
    fsa.register('fake://', fakeB);

    o(fsa.systems.length).equals(1);
    o(fsa.systems[0].system).equals(fakeB);
  });

  o('should stream files between systems', () => {
    const fakeA = new FakeSystem('fake');
    const fakeB = new FakeSystem('fakeSpecific');
    const fsa = new FileSystemAbstraction();

    const writeStub = (fakeB.write = Sinon.stub());
    const streamStub = (fakeA.stream = Sinon.stub());

    fsa.register('fake-a://', fakeA);
    fsa.register('fake-b://', fakeB);

    fsa.write('fake-b://bar.js', fsa.stream('fake-a://foo.js'));

    o(streamStub.callCount).equals(1);
    o(writeStub.callCount).equals(1);
  });
});
