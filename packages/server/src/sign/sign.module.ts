import { Module } from '@nestjs/common';
import { SignResolver } from './sign.resolver';
import { SignService } from './sign.service';

@Module({
  providers: [SignService, SignResolver]
})
export class SignModule {}
