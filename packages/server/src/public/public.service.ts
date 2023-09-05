import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublicBucket, PublicBucketDocument } from './public.model';

@Injectable()
export class PublicService {
  constructor(@InjectModel(PublicBucket.name) private readonly publicBucketModel: Model<PublicBucketDocument>) {}

  /** Set if the project is public or private */
  async changePublic(isPublic: boolean, bucket: string, project: string): Promise<void> {
    if (isPublic) {
      await this.makePublic(bucket, project);
      return;
    }
    await this.makePrivate(bucket, project);
  }

  async isPublic(bucket: string, project: string): Promise<boolean> {
    const record = await this.publicBucketModel.findOne({ bucket, project });
    return !!record;
  }

  async getPublicBuckets(project: string): Promise<string[]> {
    const publicBuckets = await this.publicBucketModel.find({ project });
    return publicBuckets.map((publicBucket) => publicBucket.bucket);
  }

  private async makePublic(bucket: string, project: string) {
    // If already public, do nothing
    if (await this.isPublic(bucket, project)) {
      return;
    }
    // Otherwise save the bucket as a public bucket
    await this.publicBucketModel.create({ bucket, project });
  }

  private async makePrivate(bucket: string, project: string) {
    await this.publicBucketModel.deleteOne({ bucket, project });
  }
}
