# Changelog

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/fs bumped from 11.0.0 to 11.0.1
    * @chunkd/source-aws bumped from 11.0.0 to 11.0.1

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/fs bumped from 11.0.1 to 11.0.2

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/fs bumped from 11.1.0 to 11.2.0

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/source-aws bumped from 11.0.2 to 11.0.3

## [11.4.0](https://github.com/blacha/chunkd/compare/fs-aws-v11.3.0...fs-aws-v11.4.0) (2025-07-16)


### Features

* expose raw response object from .head and .details ([#1582](https://github.com/blacha/chunkd/issues/1582)) ([e02b7a8](https://github.com/blacha/chunkd/commit/e02b7a81dfa3509c54e0c46314dca9bbb672c040))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/fs bumped from 11.2.0 to 11.3.0

## [11.3.0](https://github.com/blacha/chunkd/compare/fs-aws-v11.2.2...fs-aws-v11.3.0) (2024-11-03)


### Features

* **fs-aws:** add callback when credentials are dynamically loaded ([29a1e3c](https://github.com/blacha/chunkd/commit/29a1e3c94cdb6d7a636c80c72a87b9f4cc6a127c))
* **fs-aws:** add credential config for public and requester pays ([#1409](https://github.com/blacha/chunkd/issues/1409)) ([0386b61](https://github.com/blacha/chunkd/commit/0386b61e0e0fc36fefd1712f12561e723b47f6f5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/source-aws bumped from 11.0.3 to 11.0.4

## [11.2.0](https://github.com/blacha/chunkd/compare/fs-aws-v11.1.0...fs-aws-v11.2.0) (2023-09-07)


### Features

* **fs-aws:** only write test a bucket once, not once per file ([3086b1a](https://github.com/blacha/chunkd/commit/3086b1ad0b6842013024db07c3f94d4d2a112ce4))


### Bug Fixes

* **fs-aws:** AwsS3CredentialProvider is not abstract ([b3cc7f5](https://github.com/blacha/chunkd/commit/b3cc7f526ec8fe396f99ce795ee150bb1390bb58))
* **fs-aws:** correct typing for credentials ([586cccd](https://github.com/blacha/chunkd/commit/586cccd96f330893ef52b7b833b691d53b2c5d54))

## [11.1.0](https://github.com/blacha/chunkd/compare/fs-aws-v11.0.2...fs-aws-v11.1.0) (2023-08-23)


### Features

* **fs:** use "url" over "path" for url locations ([8b072bd](https://github.com/blacha/chunkd/commit/8b072bd21b70f6ba30b39d245f1f11b1a49021b5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/fs bumped from 11.0.2 to 11.1.0
    * @chunkd/source-aws bumped from 11.0.1 to 11.0.2

## [11.0.0](https://github.com/blacha/chunkd/compare/fs-aws-v10.0.9...fs-aws-v11.0.0) (2023-07-20)


### ⚠ BREAKING CHANGES

* simplify source into fetching bytes and metadata ([#1041](https://github.com/blacha/chunkd/issues/1041))

### Features

* simplify source into fetching bytes and metadata ([#1041](https://github.com/blacha/chunkd/issues/1041)) ([3cc9c01](https://github.com/blacha/chunkd/commit/3cc9c0193ebb6b8c704e977f7552544c840e65dd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/fs bumped from * to 11.0.0
    * @chunkd/source-aws bumped from * to 11.0.0
