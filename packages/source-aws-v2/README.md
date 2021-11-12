# @chunkd/source-aws-v2

Credential helper for `aws-sdk`

## Usage

```typescript
import { AwsCredentials } from '@chunkd/source-aws-v2';

const fs = AwsCredentials.fsFromRole('arn::role:foo/bar', 'externalId', 3_600);
```
