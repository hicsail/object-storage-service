import { Module } from '@nestjs/common';
import { SignResolver } from './sign.resolver';
import { SignService } from './sign.service';
import { PermsModule } from '../perms/perms.module';
import { CargoAccountModule } from '../account/account.module';

@Module({
  imports: [PermsModule, CargoAccountModule],
  providers: [SignService, SignResolver]
})
export class SignModule {}
