# Changelog

## [10.0.0](https://github.com/blacha/chunkd/compare/fs-v9.1.0...fs-v10.0.0) (2022-09-21)


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
    * @chunkd/source-file bumped from ^9.1.0 to ^10.0.0
    * @chunkd/source-http bumped from ^9.1.0 to ^10.0.0
  * optionalDependencies
    * @chunkd/source-aws bumped from ^9.1.0 to ^10.0.0
    * @chunkd/source-google-cloud bumped from ^9.1.0 to ^10.0.0

## [9.0.1](https://github.com/blacha/chunkd/compare/fs-v9.0.0...fs-v9.0.1) (2022-09-21)


### Bug Fixes

* foce all chunkd deps to 9.0.0 ([27b11be](https://github.com/blacha/chunkd/commit/27b11be8e730ef84a406798f2b6751d70f81041d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/source-file bumped from ^9.0.0 to ^9.0.1
    * @chunkd/source-http bumped from ^9.0.0 to ^9.0.1
  * optionalDependencies
    * @chunkd/source-aws bumped from ^9.0.0 to ^9.0.1
    * @chunkd/source-google-cloud bumped from ^9.0.0 to ^9.0.1

## [9.0.0](https://github.com/blacha/chunkd/compare/fs-v8.5.1...fs-v9.0.0) (2022-09-20)


### ⚠ BREAKING CHANGES

* add a .delete to remove files from locations

### Features

* add a .delete to remove files from locations ([f93d09b](https://github.com/blacha/chunkd/commit/f93d09b9cee02bf1b97089ce756883643fdcf0e6))

## [8.5.1](https://github.com/blacha/chunkd/compare/v8.5.0...v8.5.1) (2022-08-24)

**Note:** Version bump only for package @chunkd/fs





# [8.5.0](https://github.com/blacha/chunkd/compare/v8.4.0...v8.5.0) (2022-08-23)

**Note:** Version bump only for package @chunkd/fs





# [8.4.0](https://github.com/blacha/chunkd/compare/v8.3.0...v8.4.0) (2022-06-21)


### Features

* **fs:** support read-only and read-write file systems ([a7f52a9](https://github.com/blacha/chunkd/commit/a7f52a98fa897759f48c8190adb7e4836a37959e))





# [8.3.0](https://github.com/blacha/chunkd/compare/v8.2.0...v8.3.0) (2022-06-08)


### Bug Fixes

* **fs:** ensure http is registered by default in web contexts ([6b59c59](https://github.com/blacha/chunkd/commit/6b59c598138ee8a1f2b244af1e2c9fa1e3ca36e4))


### Features

* **fs:** support non recursive file listing ([#370](https://github.com/blacha/chunkd/issues/370)) ([a2828fe](https://github.com/blacha/chunkd/commit/a2828fec18db247ef89fc7becd5a57ed78090290))
* **source-memory:** add memory source ([#372](https://github.com/blacha/chunkd/issues/372)) ([b88dfe0](https://github.com/blacha/chunkd/commit/b88dfe01b5c699e02ff5b61a13fb320e70a1de9f))
* initial google cloud support ([2c9a769](https://github.com/blacha/chunkd/commit/2c9a769ba7ce84df7b73045771ef8fecececf718))





# [8.2.0](https://github.com/blacha/chunkd/compare/v8.1.0...v8.2.0) (2022-05-11)

**Note:** Version bump only for package @chunkd/fs





# [8.1.0](https://github.com/blacha/chunkd/compare/v8.0.3...v8.1.0) (2022-02-21)


### Bug Fixes

* **fs:** correct typing so fsa.stream can be used with fsa.write ([460a596](https://github.com/blacha/chunkd/commit/460a5960258d4c8f9278c925fc85e05b1f7213cb))


### Features

* **fs:** default to local file system when in nodejs ([#193](https://github.com/blacha/chunkd/issues/193)) ([ff908b0](https://github.com/blacha/chunkd/commit/ff908b0893cb31fb35dcf7bc063ba3ed84296fc0))





## [8.0.3](https://github.com/blacha/chunkd/compare/v8.0.2...v8.0.3) (2022-01-26)

**Note:** Version bump only for package @chunkd/fs





## [8.0.2](https://github.com/blacha/chunkd/compare/v8.0.1...v8.0.2) (2022-01-25)

**Note:** Version bump only for package @chunkd/fs





## [8.0.1](https://github.com/blacha/chunkd/compare/v8.0.0...v8.0.1) (2021-11-12)

**Note:** Version bump only for package @chunkd/fs





# [8.0.0](https://github.com/blacha/chunkd/compare/v7.3.1...v8.0.0) (2021-11-12)


*  feat(source-aws): support aws-sdk-v3 with a S3LikeWrapper (#92) ([0d02a69](https://github.com/blacha/chunkd/commit/0d02a69499a513f7c552969d9857de92d7449bef)), closes [#92](https://github.com/blacha/chunkd/issues/92) [#88](https://github.com/blacha/chunkd/issues/88)


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

**Note:** Version bump only for package @chunkd/fs





## [7.2.2](https://github.com/blacha/chunkd/compare/v7.2.1...v7.2.2) (2021-09-16)


### Bug Fixes

* **fs:** add .source mapping to sub file systems ([171106b](https://github.com/blacha/chunkd/commit/171106be2db6c16e2a2570405ee218036dbae64e))
* **source-aws:** aws-sdk does not export the credential providers ([4401dcc](https://github.com/blacha/chunkd/commit/4401dccc8f38dec142a44bdb267cddfe7a63a9ab))





## [7.2.1](https://github.com/blacha/chunkd/compare/v7.2.0...v7.2.1) (2021-09-15)

**Note:** Version bump only for package @chunkd/fs





# [7.2.0](https://github.com/blacha/chunkd/compare/v7.1.1...v7.2.0) (2021-09-15)


### Features

* **fs:** when writing json default to contentType of application/json ([73947fe](https://github.com/blacha/chunkd/commit/73947fe7c7d95aa1df00c9ccf72d5c3339e7f1f2))





## [7.1.1](https://github.com/blacha/chunkd/compare/v7.1.0...v7.1.1) (2021-09-15)


### Bug Fixes

* **fs:** actually expose write options for `.write` ([55ae27d](https://github.com/blacha/chunkd/commit/55ae27d4622277edad77a5ed7da70546f74880b2))





# [7.1.0](https://github.com/blacha/chunkd/compare/v7.0.1...v7.1.0) (2021-09-15)

**Note:** Version bump only for package @chunkd/fs





## [7.0.1](https://github.com/blacha/chunkd/compare/v7.0.0...v7.0.1) (2021-09-15)

**Note:** Version bump only for package @chunkd/fs





# [7.0.0](https://github.com/blacha/chunkd/compare/v6.0.0...v7.0.0) (2021-09-15)


### Features

* add file system abstraction layer ([#34](https://github.com/blacha/chunkd/issues/34)) ([a143637](https://github.com/blacha/chunkd/commit/a143637dc876cdcd4df1e86e84de8ce18caa37d4))
* add source-http to `@chunkd/fs` ([8a42472](https://github.com/blacha/chunkd/commit/8a424728ab575e9c59289a668afa83e7369bcd2a))


### BREAKING CHANGES

* this renames `@chunkd/source-url` to `@chunkd/source-http`
