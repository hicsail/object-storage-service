import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { PublicResolver } from './public.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicBucket, PublicBucketSchema } from './public.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: PublicBucket.name, schema: PublicBucketSchema }])],
  providers: [PublicService, PublicResolver],
  exports: [PublicService]
})
export class PublicModule {}
