# Changelog

## [11.3.1](https://github.com/blacha/chunkd/compare/fs-v11.3.0...fs-v11.3.1) (2026-01-29)


### Bug Fixes

* **fs:** safely join complex characters in local file systems ([249a286](https://github.com/blacha/chunkd/commit/249a28648012b6adc65400ce5e2b1f186873a50b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/source-http bumped from ^11.1.0 to ^11.1.1

## [11.3.0](https://github.com/blacha/chunkd/compare/fs-v11.2.0...fs-v11.3.0) (2025-07-16)


### Features

* expose raw response object from .head and .details ([#1582](https://github.com/blacha/chunkd/issues/1582)) ([e02b7a8](https://github.com/blacha/chunkd/commit/e02b7a81dfa3509c54e0c46314dca9bbb672c040))

## [11.2.0](https://github.com/blacha/chunkd/compare/fs-v11.1.0...fs-v11.2.0) (2023-11-08)


### Features

* **fsa:** decompress "json.gz" files automatically with readJson ([#1345](https://github.com/blacha/chunkd/issues/1345)) ([a13e380](https://github.com/blacha/chunkd/commit/a13e380caaecfe48de5341c7570938c43ec2027a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/source-http bumped from ^11.0.2 to ^11.1.0

## [11.1.0](https://github.com/blacha/chunkd/compare/fs-v11.0.2...fs-v11.1.0) (2023-08-23)


### Features

* **fs:** use "url" over "path" for url locations ([8b072bd](https://github.com/blacha/chunkd/commit/8b072bd21b70f6ba30b39d245f1f11b1a49021b5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/source bumped from ^11.0.0 to ^11.1.0
    * @chunkd/source-memory bumped from ^11.0.1 to ^11.0.2
    * @chunkd/source-file bumped from ^11.0.0 to ^11.0.1
    * @chunkd/source-http bumped from ^11.0.1 to ^11.0.2

## [11.0.2](https://github.com/blacha/chunkd/compare/fs-v11.0.1...fs-v11.0.2) (2023-08-02)


### Bug Fixes

* **fs:** correct directory names for windows ([#1241](https://github.com/blacha/chunkd/issues/1241)) ([6ba9f24](https://github.com/blacha/chunkd/commit/6ba9f24c7b7d83927b63651a350f2ca3ec5ed1d5))
* **fs:** correct error action names ([c10bbeb](https://github.com/blacha/chunkd/commit/c10bbebf0ddfae8ca91b5162057a17b3c947f2f6))
* **fs:** missing source-memory dependency ([f1ff070](https://github.com/blacha/chunkd/commit/f1ff0702c0707880c420da67562953dcbee1d0cb))

## [11.0.1](https://github.com/blacha/chunkd/compare/fs-v11.0.0...fs-v11.0.1) (2023-07-26)


### Bug Fixes

* **fs:** be more consistent when listing folders ([671845e](https://github.com/blacha/chunkd/commit/671845e040af451318d822d08e257c028d409081))
* **fs:** re-add fsa.toArray() ([0abb67b](https://github.com/blacha/chunkd/commit/0abb67b5a875931482a9ca2768b8c9d9299bec38))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/source-http bumped from ^11.0.0 to ^11.0.1

## [11.0.0](https://github.com/blacha/chunkd/compare/fs-v10.0.9...fs-v11.0.0) (2023-07-20)


### ⚠ BREAKING CHANGES

* simplify source into fetching bytes and metadata ([#1041](https://github.com/blacha/chunkd/issues/1041))

### Features

* simplify source into fetching bytes and metadata ([#1041](https://github.com/blacha/chunkd/issues/1041)) ([3cc9c01](https://github.com/blacha/chunkd/commit/3cc9c0193ebb6b8c704e977f7552544c840e65dd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/source bumped from ^10.0.0 to ^11.0.0
    * @chunkd/source-file bumped from ^10.0.6 to ^11.0.0
    * @chunkd/source-http bumped from ^10.1.2 to ^11.0.0
