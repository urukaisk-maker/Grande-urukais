import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PresignUploadDto {
  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  contentType!: string;

  @ApiProperty({ example: 'jpg', enum: ['jpg', 'jpeg', 'png', 'webp', 'gif'] })
  @IsString()
  @IsIn(['jpg', 'jpeg', 'png', 'webp', 'gif'])
  fileExtension!: string;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private s3: any;
  private bucket: string = '';
  private connected = false;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucket = this.config.get<string>('AWS_S3_BUCKET') || '';

    if (!accessKeyId || !secretAccessKey || !this.bucket) {
      this.logger.warn('AWS credentials not set — S3 storage disabled');
      return;
    }

    try {
      const { S3Client } = await import('@aws-sdk/client-s3');
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      this.s3 = { S3Client, getSignedUrl };
      this.connected = true;
      this.logger.log('AWS S3 connected');
    } catch (err: any) {
      this.logger.warn(`S3 setup failed: ${err.message} — storage disabled`);
    }
  }

  async generatePresignedUploadUrl(
    contentType: string,
    fileExtension: string,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    if (!this.connected) {
      throw new BadRequestException('S3 storage is not configured');
    }

    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    const key = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const region = this.config.get<string>('AWS_REGION') || 'eu-west-1';

    const client = new S3Client({
      region,
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

    const publicUrl = `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;

    return { uploadUrl, key, publicUrl };
  }
}
