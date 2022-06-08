import type { Readable } from 'stream';

export type S3LikeResponse<T> = Promise<T> | S3LikeV2Response<T>;
export interface S3LikeV2Response<T> {
  promise(): Promise<T>;
}

export interface S3LikeResponseStream<T> extends S3LikeV2Response<T> {
  createReadStream(): Readable;
}

export type Location = { Bucket: string; Key: string };

export type GetObjectReq = Location & { Range?: string };
export type GetObjectRes = { Body?: Buffer | unknown; ContentRange?: string };

export type UploadReq = Location & {
  Body?: Buffer | string | Readable;
  ContentEncoding?: string;
  ContentType?: string;
};
export type UploadRes = unknown;

export type ListReq = { Bucket: string; Prefix?: string; ContinuationToken?: string; Delimiter?: string };
export type ListResContents = { Key?: string; Size?: number };
export type ListRes = {
  IsTruncated?: boolean;
  NextContinuationToken?: string;
  Contents?: ListResContents[];
  CommonPrefixes?: { Prefix?: string }[];
};

export type HeadReq = Location;
export type HeadRes = { ContentLength?: number };

/** Minimal typing for a s3 like interface to make it easier to work across aws-sdk versions */
export interface S3Like {
  getObject(req: GetObjectReq): S3LikeResponseStream<GetObjectRes>;
  headObject(req: HeadReq): S3LikeResponse<HeadRes>;
  listObjectsV2(req: ListReq): S3LikeResponse<ListRes>;
  upload(req: UploadReq): S3LikeResponse<UploadRes>;
}

export function toPromise<T>(req: Promise<T> | S3LikeV2Response<T>): Promise<T> {
  if ('promise' in req) return req.promise();
  return req;
}
