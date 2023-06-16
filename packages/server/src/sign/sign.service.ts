import { SignatureV4 } from '@aws-sdk/signature-v4';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Sha256 } from '@aws-crypto/sha256-js';
import { CargoSignedRequest } from './sign.model';
import { CargoResourceRequest } from './request.dto';
import { PermService } from '../perms/perms.service';
import { TokenPayload } from '../auth/user.dto';
import { CargoAccountService } from 'src/account/account.service';
import { CargoPresignRequest } from './presign.dto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class SignService {
  constructor(private readonly permService: PermService, private readonly accountService: CargoAccountService) {}

  async signRequest(user: TokenPayload, request: CargoResourceRequest): Promise<CargoSignedRequest> {
    // Check if the user has access to the requested resource
    const isAllowed = await this.permService.hasAccess(user, request);
    if (!isAllowed) {
      throw new UnauthorizedException(`User ${user.id} does not have access`);
    }

    // Get the account associated with the user
    const account = await this.accountService.findByProject(user.projectId);
    if (!account) {
      throw new BadRequestException(`No account found for project: ${user.projectId}`);
    }

    // The signer will attempt to encode the path, therefore if the path
    // comes in already encoded then the path get's double encoded. This
    // throws off the signature resulting in a signature mismatch. Therefore
    // the path is decoded here.
    request.path = decodeURIComponent(request.path);

    // Make the SignatureV4 signer
    const signer = new SignatureV4({
      credentials: {
        accessKeyId: account.accessKey,
        secretAccessKey: account.accessSecret
      },
      region: account.s3Region,
      service: 's3',
      sha256: Sha256
    });

    // Sign the request and returned the signed information
    const signedRequest = await signer.sign(request);
    return {
      signature: signedRequest.headers.authorization,
      bodyHash: signedRequest.headers['x-amz-content-sha256'],
      timestamp: signedRequest.headers['x-amz-date']
    };
  }

  /** Generates a presigned get object URL for users with read access */
  async presignRequest(user: TokenPayload, request: CargoPresignRequest): Promise<string> {
    // Ensure the user has read access
    const userPermissions = await this.permService.getPermissionsForBucket(user, request.bucket);
    if (!userPermissions || !userPermissions.read) {
      throw new UnauthorizedException(`User cannot read from bucket ${request.bucket}`);
    }

    // Get the S3 account for the user
    const account = await this.accountService.findByProject(user.projectId);
    if (!account) {
      throw new BadRequestException(`No account for for project: ${user.projectId}`);
    }
    const s3Client = account.getS3Client();

    // Create the presigner
    const command = new GetObjectCommand({ Bucket: request.bucket, Key: request.key });
    return getSignedUrl(s3Client, command, { expiresIn: request.expires });
  }
}
