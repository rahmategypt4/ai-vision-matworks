/**
 * S3 upload service — disabled for local dev (USE_S3=false).
 * When USE_S3=true, install @aws-sdk/client-s3 and uncomment the upload logic.
 */

const USE_S3 = process.env.USE_S3 === "true";
const S3_BUCKET = process.env.S3_BUCKET ?? "";
const S3_REGION = process.env.AWS_REGION ?? "ap-southeast-1";

export async function uploadImageToS3(
  buffer: Buffer,
  key: string,
  mimeType: string
): Promise<string | null> {
  if (!USE_S3) {
    console.log(`[S3] Skipping upload (USE_S3=false). Key would be: ${key}`);
    // suppress unused variable warnings
    void buffer;
    void mimeType;
    return null;
  }

  // To enable S3:
  // 1. npm install @aws-sdk/client-s3 (inside backend/)
  // 2. Set USE_S3=true, S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY in .env
  // 3. Uncomment the block below
  //
  // const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3" as string) as any;
  // const s3 = new S3Client({ region: S3_REGION });
  // await s3.send(new PutObjectCommand({
  //   Bucket: S3_BUCKET, Key: key, Body: buffer, ContentType: mimeType, ACL: "public-read",
  // }));
  // return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;

  throw new Error("S3 not configured. Set USE_S3=false or install @aws-sdk/client-s3.");
}
