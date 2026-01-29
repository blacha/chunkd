# @chunkd

File system abstraction to work with files from various sources

- [Filesystem](./packages/source-file/)
- [Http](./packages//source-http/)
- [Aws SDK V3](./packages/source-aws/)
- [Memory](./packages/source-memory/)

## Usage

Load a chunks of data from a URL using `fetch`

```typescript
import { fsa } from '@chunkd/fs';

const source = fsa.source(new URL('https://example.com/foo.zip'));

const firstBuffer = await source.fetch(0, 1024); // Load the first 1KB from the source
const lastBuffer = await source.fetch(-1024); // load the last 1KB from the source

const size = source.metadata?.size; // File size if metadata has been fetched
```

# Building

This requires [NodeJs](https://nodejs.org/en/) >= 18 

Use [fnm](https://github.com/Schniz/fnm) to manage nodeJs versions

```bash
# Download the latest nodejs 
fnm use 24

# Install node deps
npm

# Build everything into /build
npm run build

# Run the unit tests
npm run test
```
