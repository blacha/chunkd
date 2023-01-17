# Changelog

## [9.4.0](https://github.com/blacha/chunkd/compare/source-aws-v2-v9.3.1...source-aws-v2-v9.4.0) (2023-01-17)


### Features

* **source-aws:** automatically assume roles if actions fails ([#783](https://github.com/blacha/chunkd/issues/783)) ([19735e4](https://github.com/blacha/chunkd/commit/19735e4701e1a1eb18ae2087892bc46771fb60b2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/core bumped from ^10.0.0 to ^10.1.0
    * @chunkd/source-aws bumped from ^10.0.2 to ^10.1.0

## [9.3.0](https://github.com/blacha/chunkd/compare/source-aws-v2-v9.2.0...source-aws-v2-v9.3.0) (2022-11-15)


### Features

* **source-aws-v2:** add option for a list of paths to be used for credential providers ([dcaed8e](https://github.com/blacha/chunkd/commit/dcaed8e53f0ab45b076be5695552eeaeef4373ba))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/source-aws bumped from ^10.0.0 to ^10.0.1

## [9.2.0](https://github.com/blacha/chunkd/compare/source-aws-v2-v9.1.0...source-aws-v2-v9.2.0) (2022-09-21)


### Features

* force all version numbers to be the same ([4c1b7b6](https://github.com/blacha/chunkd/commit/4c1b7b6bb92b4586826b6b4c20eef5ee848eaf7b))
* **source-aws-v2:** expose method to get the roleArn and externalId for a path ([42752e7](https://github.com/blacha/chunkd/commit/42752e79f0f59830bec14bb8a9db1963dec52da4))


### Bug Fixes

* foce all chunkd deps to 9.0.0 ([27b11be](https://github.com/blacha/chunkd/commit/27b11be8e730ef84a406798f2b6751d70f81041d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/core bumped from ^9.1.0 to ^10.0.0
    * @chunkd/source-aws bumped from ^9.1.0 to ^10.0.0

## [8.6.1](https://github.com/blacha/chunkd/compare/source-aws-v2-v8.6.0...source-aws-v2-v8.6.1) (2022-09-21)


### Bug Fixes

* foce all chunkd deps to 9.0.0 ([27b11be](https://github.com/blacha/chunkd/commit/27b11be8e730ef84a406798f2b6751d70f81041d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/source-aws bumped from ^9.0.0 to ^9.0.1

## [8.6.0](https://github.com/blacha/chunkd/compare/source-aws-v2-v8.5.1...source-aws-v2-v8.6.0) (2022-09-19)


### Features

* **source-aws-v2:** expose method to get the roleArn and externalId for a path ([42752e7](https://github.com/blacha/chunkd/commit/42752e79f0f59830bec14bb8a9db1963dec52da4))

## [8.5.1](https://github.com/blacha/chunkd/compare/v8.5.0...v8.5.1) (2022-08-24)

**Note:** Version bump only for package @chunkd/source-aws-v2





# [8.5.0](https://github.com/blacha/chunkd/compare/v8.4.0...v8.5.0) (2022-08-23)


### Features

* **source-aws:** create a credential provider ([#514](https://github.com/blacha/chunkd/issues/514)) ([167b585](https://github.com/blacha/chunkd/commit/167b585bd57ae845bf93d5351be9054ca5e80625))





# [8.4.0](https://github.com/blacha/chunkd/compare/v8.3.0...v8.4.0) (2022-06-21)

**Note:** Version bump only for package @chunkd/source-aws-v2





# [8.3.0](https://github.com/blacha/chunkd/compare/v8.2.0...v8.3.0) (2022-06-08)

**Note:** Version bump only for package @chunkd/source-aws-v2





# [8.2.0](https://github.com/blacha/chunkd/compare/v8.1.0...v8.2.0) (2022-05-11)


### Features

* **source-aws-v2:** support using a role object for role creation ([ecb2837](https://github.com/blacha/chunkd/commit/ecb2837b2841b6623c8bf6150e04c19b50efde11))





# [8.1.0](https://github.com/blacha/chunkd/compare/v8.0.3...v8.1.0) (2022-02-21)

**Note:** Version bump only for package @chunkd/source-aws-v2





## [8.0.3](https://github.com/blacha/chunkd/compare/v8.0.2...v8.0.3) (2022-01-26)

**Note:** Version bump only for package @chunkd/source-aws-v2





## [8.0.2](https://github.com/blacha/chunkd/compare/v8.0.1...v8.0.2) (2022-01-25)

**Note:** Version bump only for package @chunkd/source-aws-v2





## [8.0.1](https://github.com/blacha/chunkd/compare/v8.0.0...v8.0.1) (2021-11-12)

**Note:** Version bump only for package @chunkd/source-aws-v2





# [8.0.0](https://github.com/blacha/chunkd/compare/v7.3.1...v8.0.0) (2021-11-12)


*  feat(source-aws): support aws-sdk-v3 with a S3LikeWrapper (#92) ([0d02a69](https://github.com/blacha/chunkd/commit/0d02a69499a513f7c552969d9857de92d7449bef)), closes [#92](https://github.com/blacha/chunkd/issues/92) [#88](https://github.com/blacha/chunkd/issues/88)


### BREAKING CHANGES

* moves the credential helper into @chunkd/source-aws-v2
