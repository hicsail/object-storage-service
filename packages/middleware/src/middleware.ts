import { awsAuthMiddlewareOptions } from '@aws-sdk/middleware-signing';
import { S3MiddlewareType, S3MiddlewareStack } from './s3types';

export interface CargoMiddlewareConfig {
  /** The Cargo Server to sign against */
  cargoEndpoint: string;
};

/**
 * Make the middleware based on the provided configuration
 */
const makeMiddleware: (config: CargoMiddlewareConfig) => S3MiddlewareType = (_config) => {
  // TODO: Determing typing for next and args
  return (next: any) => async (args: any) => {
    console.log('hello');

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
