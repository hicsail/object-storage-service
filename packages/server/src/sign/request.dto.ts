import { HttpRequest } from '@aws-sdk/protocol-http';
import { InputType, Field } from '@nestjs/graphql';
import JSON from 'graphql-type-json';
import { QueryParameterBag, HeaderBag } from '@aws-sdk/types';

@InputType({ description: 'Wrapper for AWS HttpRequest' })
export class ResourceRequest implements HttpRequest {
  @Field()
  method: string;

  @Field()
  protocol: string;

  @Field()
  hostname: string;

  @Field({ nullable: true })
  port?: number;

  @Field()
  path: string;

  @Field(() => JSON)
  query: QueryParameterBag;

  @Field(() => JSON)
  headers: HeaderBag;

  @Field(() => JSON, { nullable: true })
  body?: any;

  // NOTE: This is just here to allow for implementation of the HttpRequest
  // and ensure that the other fields are included properly
  clone(): ResourceRequest {
    return { ...this };
  }
}
