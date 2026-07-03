/** @brief S3 bucket metadata. */
export interface Bucket {
  name: string;
  creationDate: string;
}

/** @brief S3 object metadata. */
export interface S3Object {
  key: string;
  size: number;
  etag: string;
  lastModified: string;
}

/** @brief Result of ListObjectsV2. */
export interface ListObjectsResult {
  name: string;
  prefix: string;
  maxKeys: number;
  isTruncated: boolean;
  contents: S3Object[];
}

/** @brief Result of ListAllMyBuckets. */
export interface ListBucketsResult {
  buckets: Bucket[];
}
