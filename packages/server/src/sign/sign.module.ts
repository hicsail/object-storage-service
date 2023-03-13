import { Module } from '@nestjs/common';
import { SignResolver } from './sign.resolver';
import { SignService } from './sign.service';
import { PermsModule } from '../perms/perms.module';

@Module({
  imports: [PermsModule],
  providers: [SignService, SignResolver]
})
export class SignModule {}
