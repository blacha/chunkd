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

This requires [NodeJs](https://nodejs.org/en/) >= 18 & [Yarn](https://yarnpkg.com/en/)

Use [fnm](https://github.com/Schniz/fnm) to manage nodeJs versions

```bash
# Download the latest nodejs & yarn
fnm use 18
npm install -g yarn

# Install node deps
yarn

# Build everything into /build
yarn run build

# Run the unit tests
yarn run test
```
