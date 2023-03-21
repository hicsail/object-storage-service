import { Module } from '@nestjs/common';
import { PermsResolver, ServiceAccountPermsResolver } from './perms.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Permissions, PermissionsSchema } from './perms.model';
import { PermService } from './perms.service';
import { CargoAccountModule } from '../account/account.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Permissions.name, schema: PermissionsSchema }]),
    CargoAccountModule
  ],
  providers: [PermsResolver, PermService, ServiceAccountPermsResolver],
  exports: [PermService]
})
export class PermsModule {}
