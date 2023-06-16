import { InputType, Field } from '@nestjs/graphql';

@InputType({ description: 'Request for a get object presigned URL' })
export class CargoPresignRequest {
  @Field()
  bucket: string;

  @Field()
  key: string;

  @Field()
  expires: number;
}
