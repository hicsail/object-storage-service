import { awsAuthMiddlewareOptions } from '@aws-sdk/middleware-signing';
import { S3MiddlewareType, S3MiddlewareStack } from './s3types';
import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client/core';
import fetch from 'cross-fetch';

export interface CargoMiddlewareConfig {
  /** The Cargo Server to sign against */
  cargoEndpoint: string;
};

/**
 * Make the middleware based on the provided configuration
 */
const makeMiddleware: (config: CargoMiddlewareConfig) => S3MiddlewareType = (config) => {
  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: config.cargoEndpoint, fetch })
  });

  // TODO: Determing typing for next and args
  return (next: any) => async (args: any) => {
    const query = gql`
      query signRequest($request: ResourceRequest!) {
        signRequest(request: $request) {
          signature,
          bodyHash
        }
      }
    `;

    const response = await apolloClient.query({ query, variables: { request: args.request } });
    const { signature, bodyHash } = response.data.signRequest;

    args.request['headers']['authorization'] = signature;
    args.request['headers']['x-amz-content-sha256'] = bodyHash;

    // Do something with the args
    return next(args);
  };
}

/**
 * Adds the Cargo Middleware to the given middleware stack after the
 * AWS signing middleware
 */
export const registerMiddleware = (config: CargoMiddlewareConfig, middlewareStack: S3MiddlewareStack): void => {
  middlewareStack.addRelativeTo(makeMiddleware(config), {
    relation: 'after',
    toMiddleware: awsAuthMiddlewareOptions.name
  });
}
