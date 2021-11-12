# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [8.0.1](https://github.com/blacha/chunkd/compare/v8.0.0...v8.0.1) (2021-11-12)

**Note:** Version bump only for package @chunkd/base





# [8.0.0](https://github.com/blacha/chunkd/compare/v7.3.1...v8.0.0) (2021-11-12)


*  feat(source-aws): support aws-sdk-v3 with a S3LikeWrapper (#92) ([0d02a69](https://github.com/blacha/chunkd/commit/0d02a69499a513f7c552969d9857de92d7449bef)), closes [#92](https://github.com/blacha/chunkd/issues/92) [#88](https://github.com/blacha/chunkd/issues/88)


### Bug Fixes

* **core:** uint16 requires 2 bytes to read from one chunk ([61c9014](https://github.com/blacha/chunkd/commit/61c9014f1157221f1d67e12b30d078db35fa51bf))
* **source-aws:** include duration unit in description ([22781a2](https://github.com/blacha/chunkd/commit/22781a2a9ddd934e7439dce7c29266cd12b8fe17))


### Performance Improvements

* reduce function calls in u8 hot path ([0f7cc57](https://github.com/blacha/chunkd/commit/0f7cc57f40a728a8e5ddebf1a166ee2029c6c67f))


### BREAKING CHANGES

* moves the credential helper into @chunkd/source-aws-v2





## [7.3.1](https://github.com/blacha/chunkd/compare/v7.3.0...v7.3.1) (2021-09-16)


### Bug Fixes

* **fs:** export AwsCredentials in nodejs ([6a03e68](https://github.com/blacha/chunkd/commit/6a03e68d6b07762e0f51cd64422d35679a433eec))





# [7.3.0](https://github.com/blacha/chunkd/compare/v7.2.4...v7.3.0) (2021-09-16)


### Features

* **fs:** support caching of aws credentials ([c0b08b3](https://github.com/blacha/chunkd/commit/c0b08b3e5c580893c783e4c0c16d884f10e971e7))





## [7.2.4](https://github.com/blacha/chunkd/compare/v7.2.3...v7.2.4) (2021-09-16)


### Bug Fixes

* **fs:** fs.source should really never be null ([05ee837](https://github.com/blacha/chunkd/commit/05ee8377204d13768f761446b0720483b3b41647))





## [7.2.3](https://github.com/blacha/chunkd/compare/v7.2.2...v7.2.3) (2021-09-16)


### Bug Fixes

* **fs:** fs.source should never return null ([4c22b84](https://github.com/blacha/chunkd/commit/4c22b844003a4a3bf59f10ee64b1156375979a8d))





## [7.2.2](https://github.com/blacha/chunkd/compare/v7.2.1...v7.2.2) (2021-09-16)


### Bug Fixes

* **core:** expose missing fetchBytes function to directly read form the source ([8dc883e](https://github.com/blacha/chunkd/commit/8dc883e3ee55c52935e689ea6051a3da00691d9b))
* **fs:** add .source mapping to sub file systems ([171106b](https://github.com/blacha/chunkd/commit/171106be2db6c16e2a2570405ee218036dbae64e))
* **source-aws:** aws-sdk does not export the credential providers ([4401dcc](https://github.com/blacha/chunkd/commit/4401dccc8f38dec142a44bdb267cddfe7a63a9ab))





## [7.2.1](https://github.com/blacha/chunkd/compare/v7.2.0...v7.2.1) (2021-09-15)


### Bug Fixes

* **source-file:** should support writing strings to files ([632170a](https://github.com/blacha/chunkd/commit/632170a60581940985e554b9074458df39e855c6))





# [7.2.0](https://github.com/blacha/chunkd/compare/v7.1.1...v7.2.0) (2021-09-15)


### Features

* **fs:** when writing json default to contentType of application/json ([73947fe](https://github.com/blacha/chunkd/commit/73947fe7c7d95aa1df00c9ccf72d5c3339e7f1f2))





## [7.1.1](https://github.com/blacha/chunkd/compare/v7.1.0...v7.1.1) (2021-09-15)


### Bug Fixes

* **fs:** actually expose write options for `.write` ([55ae27d](https://github.com/blacha/chunkd/commit/55ae27d4622277edad77a5ed7da70546f74880b2))





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
