import type {
  Bucket,
  ListObjectsResult,
  S3Object,
} from '@/types';

/** @brief Extract text content of an XML element. */
function text(
  el: Element,
  tag: string,
): string {
  return (
    el.querySelector(tag)?.textContent ?? ''
  );
}

/** @brief Parse ListAllMyBucketsResult XML. */
export function parseBucketList(
  xml: string,
): Bucket[] {
  const doc = new DOMParser().parseFromString(
    xml,
    'application/xml',
  );
  const nodes = doc.querySelectorAll('Bucket');
  return Array.from(nodes).map((el) => ({
    name: text(el, 'Name'),
    creationDate: text(el, 'CreationDate'),
  }));
}

/** @brief Parse ListBucketResult XML. */
export function parseObjectList(
  xml: string,
): ListObjectsResult {
  const doc = new DOMParser().parseFromString(
    xml,
    'application/xml',
  );
  const root = doc.documentElement;
  const items = doc.querySelectorAll('Contents');
  const contents: S3Object[] = Array.from(
    items,
  ).map((el) => ({
    key: text(el, 'Key'),
    size: Number(text(el, 'Size')),
    etag: text(el, 'ETag').replace(/"/g, ''),
    lastModified: text(el, 'LastModified'),
  }));

  return {
    name: text(root, 'Name'),
    prefix: text(root, 'Prefix'),
    maxKeys: Number(text(root, 'MaxKeys')),
    isTruncated:
      text(root, 'IsTruncated') === 'true',
    contents,
  };
}
