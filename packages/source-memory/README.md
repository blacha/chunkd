# @chunkd/source-memory

Use memory as a simple file system, 

this is designed for unit tests to prevent file system access, and not recommended for large file workloads.

## Usage

```javascript
import { FsMemory } from '@chunkd/source-memory';

fsa.register('memory://', new FsMemory());

await fsa.write('memory://foo.png', pngBuffer);

await fsa.read('memory://foo.png'); // png

```
