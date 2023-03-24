import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CargoSignedReqeuest {
  @Field(() => String, { description: 'AWS Signature based on the request' })
  signature: string;

  @Field(() => String, { description: 'SHA256 Hashed Body' })
  bodyHash: string;
}
