# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
