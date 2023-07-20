# @chunkd

File system abstraction to work with files from various sources 

- [Filesystem](./packages/source-file/)
- [Http](./packages//source-http/)
- [Aws SDK V3](./packages/source-aws/)
- [Memory](./packages/source-memory/)

## Usage

Load a chunks of data from a URL using `fetch`

```typescript
import {fsa} from '@chunkd/fs'

const source = fsa.source(new URL('https://example.com/foo.zip'));

const firstBuffer = await source.fetchBytes(0, 1024); // Load the first 1KB from the source
const lastBuffer = await source.fetchBytes(-1024); // load the last 1KB from the source

const size = source.metadata?.size; // File size if metadata has been fetched
```

# Building

This requires [NodeJs](https://nodejs.org/en/) > 12 & [Yarn](https://yarnpkg.com/en/)

Use [n](https://github.com/tj/n) to manage nodeJs versions

```bash
# Download the latest nodejs & yarn
n latest
npm install -g yarn

# Install node deps
yarn

# Build everything into /build
yarn run build

# Run the unit tests
yarn run test
```


### Performance

Performance regression is monitored with [hyperfine-action](https://github.com/blacha/hyperfine-action) with results being hosted on github pages [benchmarks.html](https://blacha.github.io/chunkd/benchmarks.html)