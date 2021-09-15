import { Readable } from 'node:stream';
import * as s3like from '../type.js';

export class FakeRemote implements s3like.S3Like {
  static id = 0;
  id = FakeRemote.id++;
  requests: { Bucket?: string; Key?: string; Range?: string }[] = [];
  data: Buffer;
  constructor(data: Buffer) {
    this.data = data;
  }
  listObjectsV2(req: s3like.ListReq): s3like.S3LikeResponse<s3like.ListRes> {
    throw new Error('Method not implemented. ' + req.Bucket);
  }
  upload(req: s3like.UploadReq): s3like.S3LikeResponse<unknown> {
    throw new Error('Method not implemented. ' + req.Key);
  }

  getObject(ctx: s3like.GetObjectReq): s3like.S3LikeResponseStream<s3like.GetObjectRes> {
    this.requests.push(ctx);

    function createReadStream(): Readable {
      throw new Error('Not implemented');
    }
    return { promise: (): any => Promise.resolve({ Body: this.data.slice() }), createReadStream };
  }

  headObject(ctx: s3like.HeadReq): s3like.S3LikeResponse<s3like.HeadRes> {
    this.requests.push(ctx);
    return { promise: (): any => Promise.resolve({ ContentLength: this.data.byteLength }) };
  }
}
