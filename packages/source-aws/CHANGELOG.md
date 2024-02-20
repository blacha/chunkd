# Changelog

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/source bumped from ^11.0.0 to ^11.1.0

## [11.0.3](https://github.com/blacha/chunkd/compare/source-aws-v11.0.2...source-aws-v11.0.3) (2024-02-20)


### Bug Fixes

* **source-aws:** Fix the Source.head function to decode url for the s3 object key. ([#1401](https://github.com/blacha/chunkd/issues/1401)) ([0eb0aa5](https://github.com/blacha/chunkd/commit/0eb0aa55076d0436d34b45e95cc898012135db93))

## [11.0.1](https://github.com/blacha/chunkd/compare/source-aws-v11.0.0...source-aws-v11.0.1) (2023-07-26)


### Bug Fixes

* **source-aws:** allow creation with string urls ([3326d16](https://github.com/blacha/chunkd/commit/3326d167ad3149c85d4a1891fe45410c04b7efe1))

## [11.0.0](https://github.com/blacha/chunkd/compare/source-aws-v10.3.0...source-aws-v11.0.0) (2023-07-20)


### ⚠ BREAKING CHANGES

* simplify source into fetching bytes and metadata ([#1041](https://github.com/blacha/chunkd/issues/1041))

### Features

* simplify source into fetching bytes and metadata ([#1041](https://github.com/blacha/chunkd/issues/1041)) ([3cc9c01](https://github.com/blacha/chunkd/commit/3cc9c0193ebb6b8c704e977f7552544c840e65dd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @chunkd/source bumped from ^10.0.0 to ^11.0.0
