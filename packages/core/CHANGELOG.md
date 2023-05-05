# Changelog

## [10.3.0](https://github.com/blacha/chunkd/compare/core-v10.2.0...core-v10.3.0) (2023-05-04)


### Features

* **source-aws:** support s3 metadata via head/write ([fd9a7c1](https://github.com/blacha/chunkd/commit/fd9a7c1f3b393fc50c624bf6c5f3b646991099b7))

## [10.2.0](https://github.com/blacha/chunkd/compare/core-v10.1.1...core-v10.2.0) (2023-04-27)


### Features

* **core:** allow more properties to be overriden by defaults ([35d76ba](https://github.com/blacha/chunkd/commit/35d76baa6ebe2e6ad8e7ed05c36ef1d2bc8670d7))
* **source-aws:** detect if the file ETag has changed between requests and error with 409 conflict. ([b6be429](https://github.com/blacha/chunkd/commit/b6be4295bf6458a3156837aa9a50be99a888b3d0))
* **source-http:** support etag matching if etags are returned ([f08bb9c](https://github.com/blacha/chunkd/commit/f08bb9c2ae894026155074161161182f78efa30b))


### Bug Fixes

* **core:** add missing ".js" extension ([eb40285](https://github.com/blacha/chunkd/commit/eb4028541eee303290b7064da75e9a4776e6dd36))

## [10.1.1](https://github.com/blacha/chunkd/compare/core-v10.1.0...core-v10.1.1) (2023-01-17)


### Bug Fixes

* reset all changelogs so release-please will add entries in the right spot ([a4aad5a](https://github.com/blacha/chunkd/commit/a4aad5ab537805055efbf943b8df53f65d6b6ddb))

## [10.1.0](https://github.com/blacha/chunkd/compare/core-v10.0.0...core-v10.1.0) (2023-01-17)


### Features

* **source-aws:** automatically assume roles if actions fails ([#783](https://github.com/blacha/chunkd/issues/783)) ([19735e4](https://github.com/blacha/chunkd/commit/19735e4701e1a1eb18ae2087892bc46771fb60b2))

## [10.0.0](https://github.com/blacha/chunkd/compare/core-v9.1.0...core-v10.0.0) (2022-09-21)


### ⚠ BREAKING CHANGES

* add a .delete to remove files from locations

### Features

* add a .delete to remove files from locations ([f93d09b](https://github.com/blacha/chunkd/commit/f93d09b9cee02bf1b97089ce756883643fdcf0e6))
* force all version numbers to be the same ([4c1b7b6](https://github.com/blacha/chunkd/commit/4c1b7b6bb92b4586826b6b4c20eef5ee848eaf7b))


### Bug Fixes

* update references to other sources ([3c17db7](https://github.com/blacha/chunkd/commit/3c17db77040c7a04300f70a74b0053d63edb075a))

## [9.0.1](https://github.com/blacha/chunkd/compare/core-v9.0.0...core-v9.0.1) (2022-09-21)


### Bug Fixes

* update references to other sources ([3c17db7](https://github.com/blacha/chunkd/commit/3c17db77040c7a04300f70a74b0053d63edb075a))

## [9.0.0](https://github.com/blacha/chunkd/compare/core-v8.4.0...core-v9.0.0) (2022-09-20)


### ⚠ BREAKING CHANGES

* add a .delete to remove files from locations

### Features

* add a .delete to remove files from locations ([f93d09b](https://github.com/blacha/chunkd/commit/f93d09b9cee02bf1b97089ce756883643fdcf0e6))

## [8.0.3](https://github.com/blacha/chunkd/compare/v8.0.2...v8.0.3) (2022-01-26)

**Note:** Version bump only for package @chunkd/core





## [8.0.2](https://github.com/blacha/chunkd/compare/v8.0.1...v8.0.2) (2022-01-25)

**Note:** Version bump only for package @chunkd/core





## [8.0.1](https://github.com/blacha/chunkd/compare/v8.0.0...v8.0.1) (2021-11-12)

**Note:** Version bump only for package @chunkd/core





# [8.0.0](https://github.com/blacha/chunkd/compare/v7.3.1...v8.0.0) (2021-11-12)


*  feat(source-aws): support aws-sdk-v3 with a S3LikeWrapper (#92) ([0d02a69](https://github.com/blacha/chunkd/commit/0d02a69499a513f7c552969d9857de92d7449bef)), closes [#92](https://github.com/blacha/chunkd/issues/92) [#88](https://github.com/blacha/chunkd/issues/88)


### Bug Fixes

* **core:** uint16 requires 2 bytes to read from one chunk ([61c9014](https://github.com/blacha/chunkd/commit/61c9014f1157221f1d67e12b30d078db35fa51bf))


### Performance Improvements

* reduce function calls in u8 hot path ([0f7cc57](https://github.com/blacha/chunkd/commit/0f7cc57f40a728a8e5ddebf1a166ee2029c6c67f))


### BREAKING CHANGES

* moves the credential helper into @chunkd/source-aws-v2





## [7.2.4](https://github.com/blacha/chunkd/compare/v7.2.3...v7.2.4) (2021-09-16)


### Bug Fixes

* **fs:** fs.source should really never be null ([05ee837](https://github.com/blacha/chunkd/commit/05ee8377204d13768f761446b0720483b3b41647))





## [7.2.3](https://github.com/blacha/chunkd/compare/v7.2.2...v7.2.3) (2021-09-16)


### Bug Fixes

* **fs:** fs.source should never return null ([4c22b84](https://github.com/blacha/chunkd/commit/4c22b844003a4a3bf59f10ee64b1156375979a8d))





## [7.2.2](https://github.com/blacha/chunkd/compare/v7.2.1...v7.2.2) (2021-09-16)


### Bug Fixes

* **core:** expose missing fetchBytes function to directly read form the source ([8dc883e](https://github.com/blacha/chunkd/commit/8dc883e3ee55c52935e689ea6051a3da00691d9b))





# [7.2.0](https://github.com/blacha/chunkd/compare/v7.1.1...v7.2.0) (2021-09-15)


### Features

* **fs:** when writing json default to contentType of application/json ([73947fe](https://github.com/blacha/chunkd/commit/73947fe7c7d95aa1df00c9ccf72d5c3339e7f1f2))





# [7.1.0](https://github.com/blacha/chunkd/compare/v7.0.1...v7.1.0) (2021-09-15)


### Features

* add options to .write ([#35](https://github.com/blacha/chunkd/issues/35)) ([16a582a](https://github.com/blacha/chunkd/commit/16a582ac81000c801ecc3736da5f54c3c9a29fea))





## [7.0.1](https://github.com/blacha/chunkd/compare/v7.0.0...v7.0.1) (2021-09-15)


### Bug Fixes

* do not use node: imports as its not supported in node 14 ([7dea1cf](https://github.com/blacha/chunkd/commit/7dea1cffaf1ecae9db689b371f8cea3d74323a40))





# [7.0.0](https://github.com/blacha/chunkd/compare/v6.0.0...v7.0.0) (2021-09-15)


### Features

* add file system abstraction layer ([#34](https://github.com/blacha/chunkd/issues/34)) ([a143637](https://github.com/blacha/chunkd/commit/a143637dc876cdcd4df1e86e84de8ce18caa37d4))
* add source-http to `@chunkd/fs` ([8a42472](https://github.com/blacha/chunkd/commit/8a424728ab575e9c59289a668afa83e7369bcd2a))


### BREAKING CHANGES

* this renames `@chunkd/source-url` to `@chunkd/source-http`





# [6.0.0](https://github.com/blacha/chunkd/compare/v5.0.0...v6.0.0) (2021-09-11)

**Note:** Version bump only for package @chunkd/core





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





# [4.3.0](https://github.com/blacha/cogeotiff/compare/v4.2.0...v4.3.0) (2021-06-22)


### Features

* **chunk:** expose a in memory chunk reader ([a550682](https://github.com/blacha/cogeotiff/commit/a5506820569d8e56f1a28648b78d86aa61d7e453))





# [4.2.0](https://github.com/blacha/cogeotiff/compare/v4.1.2...v4.2.0) (2021-03-25)


### Features

* **chunk:** add ability to read entire file using .read() ([#664](https://github.com/blacha/cogeotiff/issues/664)) ([4db04ad](https://github.com/blacha/cogeotiff/commit/4db04adc43ab4c358526e469c712f7958381d738))





## [4.1.2](https://github.com/blacha/cogeotiff/compare/v4.1.1...v4.1.2) (2021-03-18)

**Note:** Version bump only for package @chunkd/core





# [4.1.0](https://github.com/blacha/cogeotiff/compare/v4.0.0...v4.1.0) (2021-02-23)


### Features

* **chunk:** track all requests made by chunked sources ([a66da37](https://github.com/blacha/cogeotiff/commit/a66da37785c019b397882f720d0035a0a5c7b232))
* **web:** support rendering in leaflet maps ([#482](https://github.com/blacha/cogeotiff/issues/482)) ([dfb40fa](https://github.com/blacha/cogeotiff/commit/dfb40fad836d4e762bd2485a435ac402fcf1c3d6))





# [4.0.0](https://github.com/blacha/cogeotiff/compare/v3.1.0...v4.0.0) (2021-02-02)

**Note:** Version bump only for package @chunkd/core
