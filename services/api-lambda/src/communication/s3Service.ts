import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import CustomError, { StatusCodeEnum } from "../globals/customError";

export default class S3Service {
  private getClient(): S3Client {
    return new S3Client({
      region: process.env.AWS_REGION || "eu-west-3",
      forcePathStyle: true,
    });
  }

  async getSignedImageUrl(bucketName: string, key: string): Promise<string> {
    try {
      const client = this.getClient();

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(client, command, { expiresIn: 900 });
      console.log(`Generated signed URL for ${bucketName}/${key}`);
      return signedUrl;
    } catch (error) {
      console.error(`Error generating signed URL for ${bucketName}/${key}:`, {
        error,
        errorName: error instanceof Error ? error.name : "Unknown",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  async uploadFileToS3(
    file: Express.Multer.File,
    bucketName: string,
    key: string
  ): Promise<string> {
    try {
      const upload = new Upload({
        client: this.getClient(),
        params: {
          Bucket: bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
        partSize: 5 * 1024 * 1024,
        queueSize: 4,
      });

      await upload.done();
      return `https://${bucketName}.s3.${
        process.env.AWS_REGION || "eu-west-3"
      }.amazonaws.com/${key}`;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw error;
    }
  }

  async deleteFile(bucketName: string, key: string) {
    try {
      const client = this.getClient();
      const input = {
        Bucket: bucketName,
        Key: key,
      };
      const command = new DeleteObjectCommand(input);
      await client.send(command);
      return;
    } catch (err) {
      console.info("Error", err);
      return new CustomError(
        "Erreur lors de la suppression de la photo",
        StatusCodeEnum.InternalServerError
      );
    }
  }
}
