import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sha256 } from '@aws-crypto/sha256-js';
import { CargoSignedReqeuest } from './sign.model';
import { CargoResourceRequest } from './request.dto';
import { PermService } from '../perms/perms.service';
import { TokenPayload } from '../auth/user.dto';

@Injectable()
export class SignService {
  private readonly signer: SignatureV4;

  constructor(configService: ConfigService, private readonly permSerivce: PermService) {
    this.signer = new SignatureV4({
      credentials: {
        accessKeyId: configService.getOrThrow('s3.accessKeyId'),
        secretAccessKey: configService.getOrThrow('s3.secretAccessKey')
      },
      region: configService.getOrThrow('s3.region'),
      service: 's3',
      sha256: Sha256
    });
  }

  async signRequest(user: TokenPayload, request: CargoResourceRequest): Promise<CargoSignedReqeuest> {
    // Check if the user has access to the requested resource
    const isAllowed = await this.permSerivce.hasAccess(user, request);
    if (!isAllowed) {
      throw new UnauthorizedException(`User ${user.id} does not have access`);
    }

    // Sign the request and returned the signed information
    const signedRequest = await this.signer.sign(request);
    return {
      signature: signedRequest.headers.authorization,
      bodyHash: signedRequest.headers['x-amz-content-sha256']
    };
  }
}
