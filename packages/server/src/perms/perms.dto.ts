import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class PermissionChange {
  @Field()
  read: boolean;

  @Field()
  write: boolean;

  @Field()
  delete: boolean;

  @Field()
  admin: boolean;
}
