# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/core bumped from ^9.0.0 to ^9.0.1

## [10.1.0](https://github.com/blacha/chunkd/compare/source-aws-v10.0.2...source-aws-v10.1.0) (2023-01-17)


### Features

* **source-aws:** automatically assume roles if actions fails ([#783](https://github.com/blacha/chunkd/issues/783)) ([19735e4](https://github.com/blacha/chunkd/commit/19735e4701e1a1eb18ae2087892bc46771fb60b2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/core bumped from ^10.0.0 to ^10.1.0

## [10.0.2](https://github.com/blacha/chunkd/compare/source-aws-v10.0.1...source-aws-v10.0.2) (2022-11-16)


### Bug Fixes

* **source-aws:** correct parameter order for writeTest ([#687](https://github.com/blacha/chunkd/issues/687)) ([72ac028](https://github.com/blacha/chunkd/commit/72ac028b1877cf92fe9fb5bc4745ae5918d3703f))

## [10.0.1](https://github.com/blacha/chunkd/compare/source-aws-v10.0.0...source-aws-v10.0.1) (2022-11-15)


### Bug Fixes

* **source-aws:** streams cannot be read twice ([#684](https://github.com/blacha/chunkd/issues/684)) ([59369b1](https://github.com/blacha/chunkd/commit/59369b151eec981099c4c7ad859f6a3060252c5e))

## [10.0.0](https://github.com/blacha/chunkd/compare/source-aws-v9.1.0...source-aws-v10.0.0) (2022-09-21)


### ⚠ BREAKING CHANGES

* add a .delete to remove files from locations

### Features

* add a .delete to remove files from locations ([f93d09b](https://github.com/blacha/chunkd/commit/f93d09b9cee02bf1b97089ce756883643fdcf0e6))
* force all version numbers to be the same ([4c1b7b6](https://github.com/blacha/chunkd/commit/4c1b7b6bb92b4586826b6b4c20eef5ee848eaf7b))


### Bug Fixes

* foce all chunkd deps to 9.0.0 ([27b11be](https://github.com/blacha/chunkd/commit/27b11be8e730ef84a406798f2b6751d70f81041d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/core bumped from ^9.1.0 to ^10.0.0

## [9.0.1](https://github.com/blacha/chunkd/compare/source-aws-v9.0.0...source-aws-v9.0.1) (2022-09-21)


### Bug Fixes

* foce all chunkd deps to 9.0.0 ([27b11be](https://github.com/blacha/chunkd/commit/27b11be8e730ef84a406798f2b6751d70f81041d))

## [9.0.0](https://github.com/blacha/chunkd/compare/source-aws-v8.5.1...source-aws-v9.0.0) (2022-09-20)


### ⚠ BREAKING CHANGES

* add a .delete to remove files from locations

### Features

* add a .delete to remove files from locations ([f93d09b](https://github.com/blacha/chunkd/commit/f93d09b9cee02bf1b97089ce756883643fdcf0e6))

## [8.5.1](https://github.com/blacha/chunkd/compare/v8.5.0...v8.5.1) (2022-08-24)


### Bug Fixes

* **source-aws:** yeild all of the listed files ([0a152d0](https://github.com/blacha/chunkd/commit/0a152d0d516b1ab23b40ee36b1c1878cc61932bc))





# [8.5.0](https://github.com/blacha/chunkd/compare/v8.4.0...v8.5.0) (2022-08-23)


### Features

* **source-aws:** create a credential provider ([#514](https://github.com/blacha/chunkd/issues/514)) ([167b585](https://github.com/blacha/chunkd/commit/167b585bd57ae845bf93d5351be9054ca5e80625))





# [8.4.0](https://github.com/blacha/chunkd/compare/v8.3.0...v8.4.0) (2022-06-21)

**Note:** Version bump only for package @chunkd/source-aws





# [8.3.0](https://github.com/blacha/chunkd/compare/v8.2.0...v8.3.0) (2022-06-08)


### Features

* **fs:** support non recursive file listing ([#370](https://github.com/blacha/chunkd/issues/370)) ([a2828fe](https://github.com/blacha/chunkd/commit/a2828fec18db247ef89fc7becd5a57ed78090290))
* initial google cloud support ([2c9a769](https://github.com/blacha/chunkd/commit/2c9a769ba7ce84df7b73045771ef8fecececf718))





# [8.2.0](https://github.com/blacha/chunkd/compare/v8.1.0...v8.2.0) (2022-05-11)

**Note:** Version bump only for package @chunkd/source-aws





# [8.1.0](https://github.com/blacha/chunkd/compare/v8.0.3...v8.1.0) (2022-02-21)


### Features

* remove logger a tracking source can be used instead ([151dd08](https://github.com/blacha/chunkd/commit/151dd08e2052daa09ccda1f2df55adc95cdf126f))





## [8.0.3](https://github.com/blacha/chunkd/compare/v8.0.2...v8.0.3) (2022-01-26)

**Note:** Version bump only for package @chunkd/source-aws





## [8.0.2](https://github.com/blacha/chunkd/compare/v8.0.1...v8.0.2) (2022-01-25)

**Note:** Version bump only for package @chunkd/source-aws





## [8.0.1](https://github.com/blacha/chunkd/compare/v8.0.0...v8.0.1) (2021-11-12)

**Note:** Version bump only for package @chunkd/source-aws





# [8.0.0](https://github.com/blacha/chunkd/compare/v7.3.1...v8.0.0) (2021-11-12)


*  feat(source-aws): support aws-sdk-v3 with a S3LikeWrapper (#92) ([0d02a69](https://github.com/blacha/chunkd/commit/0d02a69499a513f7c552969d9857de92d7449bef)), closes [#92](https://github.com/blacha/chunkd/issues/92) [#88](https://github.com/blacha/chunkd/issues/88)


### Bug Fixes

* **source-aws:** include duration unit in description ([22781a2](https://github.com/blacha/chunkd/commit/22781a2a9ddd934e7439dce7c29266cd12b8fe17))


### BREAKING CHANGES

* moves the credential helper into @chunkd/source-aws-v2





# [7.3.0](https://github.com/blacha/chunkd/compare/v7.2.4...v7.3.0) (2021-09-16)


### Features

* **fs:** support caching of aws credentials ([c0b08b3](https://github.com/blacha/chunkd/commit/c0b08b3e5c580893c783e4c0c16d884f10e971e7))





## [7.2.4](https://github.com/blacha/chunkd/compare/v7.2.3...v7.2.4) (2021-09-16)

**Note:** Version bump only for package @chunkd/source-aws





## [7.2.3](https://github.com/blacha/chunkd/compare/v7.2.2...v7.2.3) (2021-09-16)


### Bug Fixes

* **fs:** fs.source should never return null ([4c22b84](https://github.com/blacha/chunkd/commit/4c22b844003a4a3bf59f10ee64b1156375979a8d))





## [7.2.2](https://github.com/blacha/chunkd/compare/v7.2.1...v7.2.2) (2021-09-16)


### Bug Fixes

* **source-aws:** aws-sdk does not export the credential providers ([4401dcc](https://github.com/blacha/chunkd/commit/4401dccc8f38dec142a44bdb267cddfe7a63a9ab))





# [7.2.0](https://github.com/blacha/chunkd/compare/v7.1.1...v7.2.0) (2021-09-15)

**Note:** Version bump only for package @chunkd/source-aws





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


### BREAKING CHANGES

* this renames `@chunkd/source-url` to `@chunkd/source-http`





# [6.0.0](https://github.com/blacha/chunkd/compare/v5.0.0...v6.0.0) (2021-09-11)

**Note:** Version bump only for package @chunkd/source-aws





# [5.0.0](https://github.com/blacha/chunkd/compare/v4.5.1...v5.0.0) (2021-09-11)

**Note:** Version bump only for package @chunkd/source-aws





## [4.5.1](https://github.com/blacha/chunkd/compare/v4.5.0...v4.5.1) (2021-07-22)

**Note:** Version bump only for package @chunkd/source-aws





# [4.5.0](https://github.com/blacha/chunkd/compare/v4.4.0...v4.5.0) (2021-07-21)

**Note:** Version bump only for package @chunkd/source-aws





# 4.4.0 (2021-07-21)


### Features

* split from https://github.com/blacha/cogeotiff ([95c0372](https://github.com/blacha/chunkd/commit/95c03720b8eadfff4cd493695466a5b029b2727b))
* support bigint when reading uint64 ([5a43991](https://github.com/blacha/chunkd/commit/5a43991ee382918e9244b786084bc693ecc10145))





# [4.3.0](https://github.com/blacha/cogeotiff/compare/v4.2.0...v4.3.0) (2021-06-22)

**Note:** Version bump only for package @cogeotiff/source-aws





# [4.2.0](https://github.com/blacha/cogeotiff/compare/v4.1.2...v4.2.0) (2021-03-25)


### Features

* **chunk:** add ability to read entire file using .read() ([#664](https://github.com/blacha/cogeotiff/issues/664)) ([4db04ad](https://github.com/blacha/cogeotiff/commit/4db04adc43ab4c358526e469c712f7958381d738))





## [4.1.2](https://github.com/blacha/cogeotiff/compare/v4.1.1...v4.1.2) (2021-03-18)

**Note:** Version bump only for package @cogeotiff/source-aws





# [4.1.0](https://github.com/blacha/cogeotiff/compare/v4.0.0...v4.1.0) (2021-02-23)


### Features

* **web:** support rendering in leaflet maps ([#482](https://github.com/blacha/cogeotiff/issues/482)) ([dfb40fa](https://github.com/blacha/cogeotiff/commit/dfb40fad836d4e762bd2485a435ac402fcf1c3d6))





# [4.0.0](https://github.com/blacha/cogeotiff/compare/v3.1.0...v4.0.0) (2021-02-02)

**Note:** Version bump only for package @cogeotiff/source-aws





# [3.1.0](https://github.com/blacha/cogeotiff/compare/v3.0.0...v3.1.0) (2021-01-18)

**Note:** Version bump only for package @cogeotiff/source-aws





# [3.0.0](https://github.com/blacha/cogeotiff/compare/v2.2.0...v3.0.0) (2020-10-30)


### Features

* **source-aws:** remove aws-sdk typings ([#582](https://github.com/blacha/cogeotiff/issues/582)) ([45527e3](https://github.com/blacha/cogeotiff/commit/45527e3))


### BREAKING CHANGES

* **source-aws:** a default s3 object needs to be used when using the S3 Source, this can be set with `
CogSourceAwsS3.DefaultS3 = new S3();`

* build(deps): squash deps





# [2.2.0](https://github.com/blacha/cogeotiff/compare/v2.1.1...v2.2.0) (2020-07-01)


### Features

* adding uri for a full reference for any source ([#469](https://github.com/blacha/cogeotiff/issues/469)) ([137d9c9](https://github.com/blacha/cogeotiff/commit/137d9c9))





## [2.1.1](https://github.com/blacha/cogeotiff/compare/v2.1.0...v2.1.1) (2020-06-25)

**Note:** Version bump only for package @cogeotiff/source-aws





# [2.1.0](https://github.com/blacha/cogeotiff/compare/v2.0.0...v2.1.0) (2020-06-14)

**Note:** Version bump only for package @cogeotiff/source-aws





# [2.0.0](https://github.com/blacha/cogeotiff/compare/v1.1.0...v2.0.0) (2020-05-18)

**Note:** Version bump only for package @cogeotiff/source-aws





## [1.0.8](https://github.com/blacha/cogeotiff/compare/v1.0.7...v1.0.8) (2020-05-11)


### Bug Fixes

* **source-aws:** rethrow aws errors with  more context ([#389](https://github.com/blacha/cogeotiff/issues/389)) ([853155a](https://github.com/blacha/cogeotiff/commit/853155a))





## [1.0.7](https://github.com/blacha/cogeotiff/compare/v1.0.6...v1.0.7) (2020-05-10)

**Note:** Version bump only for package @cogeotiff/source-aws





## [1.0.6](https://github.com/blacha/cogeotiff/compare/v1.0.5...v1.0.6) (2020-05-07)

**Note:** Version bump only for package @cogeotiff/source-aws





## [1.0.5](https://github.com/blacha/cogeotiff/compare/v1.0.4...v1.0.5) (2020-05-07)

**Note:** Version bump only for package @cogeotiff/source-aws





## [1.0.4](https://github.com/blacha/cogeotiff/compare/v1.0.3...v1.0.4) (2020-04-29)

**Note:** Version bump only for package @cogeotiff/source-aws





## [1.0.3](https://github.com/blacha/cogeotiff/compare/v1.0.2...v1.0.3) (2020-03-12)

**Note:** Version bump only for package @cogeotiff/source-aws





## [1.0.2](https://github.com/blacha/cogeotiff/compare/v1.0.1...v1.0.2) (2020-03-12)

**Note:** Version bump only for package @cogeotiff/source-aws





## [1.0.1](https://github.com/blacha/cogeotiff/compare/v1.0.0...v1.0.1) (2020-03-10)

**Note:** Version bump only for package @cogeotiff/source-aws





# [1.0.0](https://github.com/blacha/cogeotiff/compare/v0.9.1...v1.0.0) (2020-03-09)

**Note:** Version bump only for package @cogeotiff/source-aws





# [0.9.0](https://github.com/blacha/cogeotiff/compare/v0.8.0...v0.9.0) (2020-01-16)


### Features

* allow the cli to load geotiffs from s3 ([8db14c9](https://github.com/blacha/cogeotiff/commit/8db14c9))





# [0.8.0](https://github.com/blacha/cogeotiff/compare/v0.7.0...v0.8.0) (2020-01-16)


### Features

* allow overwriting of s3 read config ([b37ba15](https://github.com/blacha/cogeotiff/commit/b37ba15))





# [0.7.0](https://github.com/blacha/cogeotiff/compare/v0.6.0...v0.7.0) (2019-12-08)


### Features

* parse s3 uris ([11ead99](https://github.com/blacha/cogeotiff/commit/11ead99))





# [0.6.0](https://github.com/blacha/cogeotiff/compare/v0.5.0...v0.6.0) (2019-11-22)

**Note:** Version bump only for package @cogeotiff/source-aws





# [0.5.0](https://github.com/blacha/cogeotiff/compare/v0.4.1...v0.5.0) (2019-11-21)


### Features

* typescript 3.7 ([ada8c2b](https://github.com/blacha/cogeotiff/commit/ada8c2b))





## [0.4.1](https://github.com/blacha/cogeotiff/compare/v0.4.0...v0.4.1) (2019-10-08)

**Note:** Version bump only for package @cogeotiff/source-aws





# [0.4.0](https://github.com/blacha/cogeotiff/compare/v0.3.1...v0.4.0) (2019-10-08)


### Features

* lazy load more data to reduce initial read time for ifd ([74e1dc7](https://github.com/blacha/cogeotiff/commit/74e1dc7))





## [0.3.1](https://github.com/blacha/cogeotiff/compare/v0.3.0...v0.3.1) (2019-09-25)

**Note:** Version bump only for package @cogeotiff/source-aws





# [0.3.0](https://github.com/blacha/cogeotiff/compare/v0.2.3...v0.3.0) (2019-09-24)

**Note:** Version bump only for package @cogeotiff/source-aws





## [0.2.2](https://github.com/blacha/cogeotiff/compare/v0.2.1...v0.2.2) (2019-09-12)


### Bug Fixes

* ignore tsconfig.tsbuildinfo when publishing ([8a27600](https://github.com/blacha/cogeotiff/commit/8a27600))





## [0.2.1](https://github.com/blacha/cogeotiff/compare/v0.2.0...v0.2.1) (2019-09-12)


### Bug Fixes

* cannot publish without access:public ([a408389](https://github.com/blacha/cogeotiff/commit/a408389))





# [0.2.0](https://github.com/blacha/cogeotiff/compare/v0.0.12...v0.2.0) (2019-09-12)


### Bug Fixes

* expose aws cog source ([858990d](https://github.com/blacha/cogeotiff/commit/858990d))


### Features

* rename to cogeotiff ([9a2c099](https://github.com/blacha/cogeotiff/commit/9a2c099))
* switch to cogeotiff ([6ab420a](https://github.com/blacha/cogeotiff/commit/6ab420a))
