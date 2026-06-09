/**
 * Alibaba Cloud OSS Client
 *
 * Uses AWS S3 SDK v3 with Alibaba Cloud OSS S3-compatible endpoint.
 * Supports upload, delete, signed URL generation.
 *
 * Environment Variables:
 * - OSS_ENDPOINT: e.g. oss-us-west-1.aliyuncs.com
 * - OSS_ACCESS_KEY_ID: Alibaba Cloud AccessKey ID
 * - OSS_SECRET_ACCESS_KEY: Alibaba Cloud AccessKey Secret
 * - OSS_BUCKET_NAME: Bucket name
 * - OSS_REGION: Region, e.g. us-west-1
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Singleton S3 client
let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (_s3Client) return _s3Client;

  const endpoint = process.env.OSS_ENDPOINT;
  const region = process.env.OSS_REGION || 'us-west-1';
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.OSS_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing OSS configuration. Please set OSS_ENDPOINT, OSS_ACCESS_KEY_ID, OSS_SECRET_ACCESS_KEY environment variables.'
    );
  }

  _s3Client = new S3Client({
    region,
    endpoint: `https://${endpoint}`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    // Alibaba Cloud OSS uses virtual-hosted style by default
    // bucket-name.endpoint/key
    forcePathStyle: false,
  });

  return _s3Client;
}

function getBucketName(): string {
  const bucket = process.env.OSS_BUCKET_NAME;
  if (!bucket) {
    throw new Error('Missing OSS_BUCKET_NAME environment variable.');
  }
  return bucket;
}

/**
 * Upload a file to Alibaba Cloud OSS
 * @returns The actual S3 key of the uploaded file
 */
export async function ossUploadFile(params: {
  fileContent: Buffer | Uint8Array;
  key: string;
  contentType?: string;
}): Promise<string> {
  const client = getS3Client();
  const bucket = getBucketName();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    Body: params.fileContent,
    ContentType: params.contentType || 'application/octet-stream',
  });

  await client.send(command);
  return params.key;
}

/**
 * Delete a file from Alibaba Cloud OSS
 */
export async function ossDeleteFile(params: { key: string }): Promise<boolean> {
  const client = getS3Client();
  const bucket = getBucketName();

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: params.key,
  });

  await client.send(command);
  return true;
}

/**
 * Generate a presigned URL for downloading a file
 * @param key - The S3 key of the file
 * @param expireTime - Expiration time in seconds (default: 3600 = 1 hour)
 */
export async function ossGeneratePresignedUrl(params: {
  key: string;
  expireTime?: number;
}): Promise<string> {
  const client = getS3Client();
  const bucket = getBucketName();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: params.key,
  });

  const url = await getSignedUrl(client, command, {
    expiresIn: params.expireTime || 3600,
  });

  return url;
}

/**
 * Check if a value is an OSS key (not a local path)
 * OSS keys do NOT start with '/'
 */
export function isOssKey(value: string): boolean {
  if (!value) return false;
  // Local paths start with '/' like '/images/xxx.jpg'
  // Full URLs start with 'http'
  // OSS keys are like 'thumbnails/xxx.jpg' or 'hd/xxx.jpg'
  return !value.startsWith('/') && !value.startsWith('http');
}

/**
 * Get the public URL for an OSS object (without signing)
 * Only works if the object has public read access via bucket policy
 */
export function getOssPublicUrl(key: string): string {
  const endpoint = process.env.OSS_ENDPOINT;
  const bucket = process.env.OSS_BUCKET_NAME;
  if (!endpoint || !bucket) {
    throw new Error('Missing OSS_ENDPOINT or OSS_BUCKET_NAME');
  }
  return `https://${bucket}.${endpoint}/${key}`;
}

/**
 * Resolve an image URL from a database value
 * - If it's a local path (/images/xxx.jpg), return as-is
 * - If it's an OSS key (thumbnails/xxx.jpg), generate a signed URL
 * - If it's already a full URL, return as-is
 */
export async function resolveImageUrl(
  value: string,
  signedUrlExpireTime: number = 86400 // 24 hours for thumbnails
): Promise<string> {
  if (!value) return '';
  // Local path or full URL - return as-is
  if (value.startsWith('/') || value.startsWith('http')) {
    return value;
  }
  // OSS key - generate signed URL
  return ossGeneratePresignedUrl({ key: value, expireTime: signedUrlExpireTime });
}

/**
 * Batch resolve image URLs for page rendering
 */
export async function resolveImageUrls(
  values: string[],
  signedUrlExpireTime: number = 86400
): Promise<string[]> {
  return Promise.all(values.map((v) => resolveImageUrl(v, signedUrlExpireTime)));
}
