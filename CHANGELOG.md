# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [7.1.0](https://github.com/blacha/chunkd/compare/v7.0.1...v7.1.0) (2021-09-15)


### Features

* add options to .write ([#35](https://github.com/blacha/chunkd/issues/35)) ([16a582a](https://github.com/blacha/chunkd/commit/16a582ac81000c801ecc3736da5f54c3c9a29fea))





## [7.0.1](https://github.com/blacha/chunkd/compare/v7.0.0...v7.0.1) (2021-09-15)


### Bug Fixes

* do not use node: imports as its not supported in node 14 ([7dea1cf](https://github.com/blacha/chunkd/commit/7dea1cffaf1ecae9db689b371f8cea3d74323a40))





# [7.0.0](https://github.com/blacha/chunkd/compare/v6.0.0...v7.0.0) (2021-09-15)


### Features

* **source-aws:** add support for easily assuming roles ([11d7a1c](https://github.com/blacha/chunkd/commit/11d7a1ce87a35b33ab5da66dca9de553c179c602))
* add file system abstraction layer ([#34](https://github.com/blacha/chunkd/issues/34)) ([a143637](https://github.com/blacha/chunkd/commit/a143637dc876cdcd4df1e86e84de8ce18caa37d4))
* add source-http to `@chunkd/fs` ([8a42472](https://github.com/blacha/chunkd/commit/8a424728ab575e9c59289a668afa83e7369bcd2a))


### BREAKING CHANGES

* this renames `@chunkd/source-url` to `@chunkd/source-http`





# [6.0.0](https://github.com/blacha/chunkd/compare/v5.0.0...v6.0.0) (2021-09-11)

**Note:** Version bump only for package @chunkd/base





# [5.0.0](https://github.com/blacha/chunkd/compare/v4.5.1...v5.0.0) (2021-09-11)


### Features

* expand on base chunk interface ([c0fc297](https://github.com/blacha/chunkd/commit/c0fc297b384e345e7cd6ac6e40c9a0ea00622ad0))





## [4.5.1](https://github.com/blacha/chunkd/compare/v4.5.0...v4.5.1) (2021-07-22)


### Bug Fixes

* **core:** correct little endian logic for bigUint64 when crossing chunk boundaries ([84739c5](https://github.com/blacha/chunkd/commit/84739c5ee2e3c5e44f6ac67b32ec2473e61c319e))
* **core:** correctly sign uint32 across chunk boundaries ([a0ce89b](https://github.com/blacha/chunkd/commit/a0ce89b3bb5af1f832aa29a75b49561ab033fac1))





# [4.5.0](https://github.com/blacha/chunkd/compare/v4.4.0...v4.5.0) (2021-07-21)


### Features

* **core:** support passing buffers to memory source ([637406f](https://github.com/blacha/chunkd/commit/637406f10dab22723a4355878f4257e6c8888f77))





# 4.4.0 (2021-07-21)


### Features

* split from https://github.com/blacha/cogeotiff ([95c0372](https://github.com/blacha/chunkd/commit/95c03720b8eadfff4cd493695466a5b029b2727b))
* support bigint when reading uint64 ([5a43991](https://github.com/blacha/chunkd/commit/5a43991ee382918e9244b786084bc693ecc10145))