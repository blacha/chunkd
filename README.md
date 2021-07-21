# @chunkd

[![Build Status](https://github.com/blacha/chunkd/workflows/Main/badge.svg)](https://github.com/blacha/chunkd/actions)


File abstraction to read chunks of files from various sources

## Usage

Load a COG from a URL using `fetch`

```typescript
import { SourceUrl } from '@chunkd/source-url';

const source = new SourceUrl('https://example.com/cog.tif');
await SourceUrl.loadBytes(0, 1024); // Load 1KB of data from the source file starting at byte 0
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
