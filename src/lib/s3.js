import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.IM_AWS_REGION,
  credentials: {
    accessKeyId: process.env.IM_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.IM_AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a file (buffer) to S3 and returns the public URL.
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Unique filename
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
export async function uploadFileToS3(buffer, fileName, mimeType) {
  const bucketName = process.env.IM_AWS_BUCKET_NAME;

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: mimeType,
    // ACL: "public-read", // Uncomment if bucket allows ACLs, otherwise use bucket policy
  };

  const command = new PutObjectCommand(params);

  try {
    await s3Client.send(command);
    // Construct public URL (assuming standard S3 public access or CloudFront)
    // Format: https://{bucketName}.s3.{region}.amazonaws.com/{fileName}
    const url = `https://${bucketName}.s3.${process.env.IM_AWS_REGION}.amazonaws.com/${fileName}`;
    return url;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error("Failed to upload file to S3");
  }
}
