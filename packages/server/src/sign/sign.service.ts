import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sha256 } from '@aws-crypto/sha256-js';
import { SignedReqeuest } from './sign.model';
import { ResourceRequest } from './request.dto';

@Injectable()
export class SignService {
  private readonly signer: SignatureV4;

  constructor(configService: ConfigService) {
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

  async signRequest(request: ResourceRequest): Promise<SignedReqeuest> {
    // TODO: Validate permission to access request
    const signedRequest = await this.signer.sign(request);

    return {
      signature: signedRequest.headers.authorization,
      bodyHash: signedRequest.headers['x-amz-content-sha256']
    };
  }
}
