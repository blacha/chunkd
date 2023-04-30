import { FsFile } from '../systems/file.js';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import Sinon from 'sinon';
import { FileSystemAbstraction } from '../file.system.abstraction.js';

export class FakeSystem extends FsFile {
  constructor(protocol = 'fake') {
    super();
    this.name = protocol;
  }
}

describe('FileSystemAbstraction', () => {
  const fake = new URL('fake://foo');
  it('should register new file systems', () => {
    const fsa = new FileSystemAbstraction();

    const fakeLocal = new FakeSystem('fake');
    fsa.register('fake://', fakeLocal);
    const fakeUnknown = new FakeSystem('unknown');
    fsa.register('', fakeUnknown);

    assert.equal(fsa.get(fake, 'r').name, 'fake');
    assert.equal(fsa.get(new URL('fakeA://foo'), 'r').name, 'unknown');
  });

  it('should register filesystems as rw', () => {
    const fsa = new FileSystemAbstraction();

    const fakeLocal = new FakeSystem('fake');
    fsa.register('fake://', fakeLocal);
    assert.equal(fsa.get(fake, 'rw').name, 'fake');
  });

  it('should not return a read only filesystem when wanting to write', () => {
    const fsa = new FileSystemAbstraction();

    const fakeLocal = new FakeSystem('fake');
    fsa.register('fake://', fakeLocal, 'r');
    assert.throws(() => fsa.get(fake, 'rw'));
  });

  it('should allow read and read-write file systems to be registered', () => {
    const fsa = new FileSystemAbstraction();

    const fakeR = new FakeSystem('r');
    const fakeRw = new FakeSystem('rw');

    fsa.register('fake://', fakeR, 'r');
    fsa.register('fake://', fakeRw, 'rw');
    assert.equal(fsa.get(fake, 'rw').name, 'rw');
  });

  it('should find file systems in order they were registered', () => {
    const fakeA = new FakeSystem('fake');
    const fakeB = new FakeSystem('fakeSpecific');
    const fsa = new FileSystemAbstraction();

    fsa.register('fake://', fakeA);
    fsa.register('fake://some-prefix-string/', fakeB);

    assert.equal(fsa.get(fake, 'r').name, 'fake');
    assert.equal(fsa.get(new URL('fake://some-prefix-string/'), 'r').name, 'fakeSpecific');
    assert.equal(fsa.get(new URL('fake://some-prefix-string/some-key'), 'r').name, 'fakeSpecific');
  });

  it('should order file systems by length', () => {
    const fakeA = new FakeSystem('fake');
    const fakeB = new FakeSystem('fakeSpecific');
    const fsa = new FileSystemAbstraction();

    fsa.register('fake://some-prefix-string/', fakeB);
    fsa.register('fake://', fakeA);

    assert.equal(fsa.get(fake, 'r').name, 'fake');
    assert.equal(fsa.get(new URL('fake://some-prefix-string/'), 'r').name, 'fakeSpecific');
    assert.equal(fsa.get(new URL('fake://some-prefix-string/some-key'), 'r').name, 'fakeSpecific');
  });

  it('should replace file systems when registering duplicates', () => {
    const fakeA = new FakeSystem('fake');
    const fakeB = new FakeSystem('fakeSpecific');
    const fsa = new FileSystemAbstraction();

    fsa.register('fake://', fakeA);
    fsa.register('fake://', fakeB);

    assert.equal(fsa.systems.length, 1);
    assert.equal(fsa.systems[0].system, fakeB);
  });

  it('should stream files between systems', () => {
    const fakeA = new FakeSystem('fake');
    const fakeB = new FakeSystem('fakeSpecific');
    const fsa = new FileSystemAbstraction();

    const writeStub = (fakeB.write = Sinon.stub());
    const streamStub = (fakeA.stream = Sinon.stub());

    fsa.register('fake-a://', fakeA);
    fsa.register('fake-b://', fakeB);

    fsa.write(new URL('fake-b://bar.js'), fsa.stream(new URL('fake-a://foo.js')));

    assert.equal(streamStub.callCount, 1);
    assert.equal(writeStub.callCount, 1);
  });
});
