import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CargoSignedRequest {
  @Field(() => String, { description: 'AWS Signature based on the request' })
  signature: string;

  @Field(() => String, { description: 'SHA256 Hashed Body' })
  bodyHash: string;

  @Field(() => String, { description: 'AWS format timestamp' })
  timestamp: string;
}
