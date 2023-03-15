import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { registerMiddleware } from '@hicsail/cargo-middleware';

// NOTE: For this sample, the JWT is expected as an environment. Since JWTs
// expire this is not recommended for production
import * as dotenv from 'dotenv';
dotenv.config();

// Endpoint to sign against
const CARGO_ENDPOINT = 'http://localhost:3000/graphql';

// Function to get the JWT. This function will be called on every request.
const getJWTToken: () => Promise<string> = async () => {
  return process.env.JWT_TOKEN;
}

async function main() {
  const client = new S3Client({
    forcePathStyle: true,

    // The following need to exist for the S3 Client to work, but the values
    // themselves do not matter
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'AKID',
      secretAccessKey: 'SECRET'
    }
  });
  registerMiddleware({ cargoEndpoint: CARGO_ENDPOINT, jwtTokenProvider: getJWTToken }, client.middlewareStack);

  const response = await client.send(new ListBucketsCommand({}));
  console.log(response);
}

main();
