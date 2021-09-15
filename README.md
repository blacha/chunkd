# @chunkd

[![Build Status](https://github.com/blacha/chunkd/workflows/Main/badge.svg)](https://github.com/blacha/chunkd/actions)


File system abstraction to read files from various sources

## Usage

Load a chunks of data from a URL using `fetch`

```typescript
import {SourceHttp} from '@chunkd/source-http'
const source = new SourceHttp('https://example.com/foo')
// Read 1KB chunks
source.chunkSize = 1024;

// Read the first 2KB of the file, or two chunks of data, this will be one HTTP Range requests
if (!source.hasBytes(0, 2048)) await source.loadBytes(0, 2048)

const bytes = source.bytes(0, 2048);

// Accessing data using Dataview methods
bytes.getUint8(1024);
bytes.getUint16(1024);
bytes.getUint32(1024);
bytes.getUint64(1024); // Read a bigint as a number this may loose precision
bytes.getBigUint64(1024);
```


```typescript
import {fsa} from '@chunkd/fs'

const source = fsa.source('https://example.com/foo.zip');
source.chunkSize = 1024;
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
