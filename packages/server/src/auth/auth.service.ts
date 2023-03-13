import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService {
  private publicKey: string | null = null;

  constructor(private readonly configService: ConfigService, private readonly httpService: HttpService) {}

  async getPublicKey() {
    if (!this.publicKey) {
      this.publicKey = await this.loadPublicKey();
    }
    return this.publicKey;
  }

  private async loadPublicKey(): Promise<string> {
    const publicKeyUri = this.configService.getOrThrow('auth.publicKeyUri');
    const response = await firstValueFrom(this.httpService.get(publicKeyUri));
    // TODO: In the future key rotation will be supported
    return response.data[0];
  }
}
