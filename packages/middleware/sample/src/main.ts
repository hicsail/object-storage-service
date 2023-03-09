import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { registerMiddleware } from '@hicsail/cargo-middleware';

const CARGO_ENDPOINT = 'http://localhost:3000/graphql';

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
  registerMiddleware({ cargoEndpoint: CARGO_ENDPOINT }, client.middlewareStack);

  const response = await client.send(new ListBucketsCommand({}));
  console.log(response);
}

main();
