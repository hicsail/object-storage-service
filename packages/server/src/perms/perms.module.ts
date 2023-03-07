import { Module } from '@nestjs/common';
import { PermsResolver } from './perms.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Permissions, PermissionsSchema } from './perms.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Permissions.name, schema: PermissionsSchema }])
  ],
  providers: [PermsResolver]
})
export class PermsModule {}
