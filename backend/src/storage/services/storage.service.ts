import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: Client;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('MINIO_BUCKET')!;
    this.client = new Client({
      endPoint: config.get<string>('MINIO_ENDPOINT')!,
      port: config.get<number>('MINIO_PORT'),
      accessKey: config.get<string>('MINIO_ACCESS_KEY'),
      secretKey: config.get<string>('MINIO_SECRET_KEY'),
      useSSL: config.get<string>('MINIO_USE_SSL') === 'true',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureBucketExists();
  }

  async ensureBucketExists(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      this.logger.log(`Bucket "${this.bucket}" created`);
    }
  }

  async uploadFile(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    await this.client.putObject(this.bucket, key, buffer, buffer.length, {
      'Content-Type': mimeType,
    });
  }

  async getPresignedUrl(key: string, expirySeconds: number): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, expirySeconds);
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }
}
