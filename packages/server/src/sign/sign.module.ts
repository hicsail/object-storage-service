import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SignResolver } from './sign.resolver';
import { SignService } from './sign.service';

@Module({
  imports: [ConfigModule],
  providers: [SignService, SignResolver]
})
export class SignModule {}
