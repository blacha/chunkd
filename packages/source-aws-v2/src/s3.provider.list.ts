import { FsAwsS3, FsAwsS3Provider } from '@chunkd/source-aws';
import { FileSystem } from '@chunkd/core';
import { FsAwsS3ProviderV2 } from './s3.provider.js';

export class FsAwsS3ProviderList implements FsAwsS3Provider {
  providers: FsAwsS3ProviderV2[] = [];

  constructor(paths: string[], fs: FileSystem) {
    for (const path of paths) {
      const provider = new FsAwsS3ProviderV2(path, fs);
      this.providers.push(provider);
    }
  }

  async find(path: string): Promise<FsAwsS3 | null> {
    for (const provider of this.providers) {
      const found = await provider.find(path);
      if (found) return found;
    }
    return null;
  }
}
