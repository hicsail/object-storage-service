import { Module, forwardRef } from '@nestjs/common';
import { PermsResolver, ServiceAccountPermsResolver } from './perms.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Permissions, PermissionsSchema } from './perms.model';
import { ProjectModule } from '../project/project.module';
import { PermService } from './perms.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Permissions.name, schema: PermissionsSchema }]),
    forwardRef(() => ProjectModule)
  ],
  providers: [PermsResolver, PermService, ServiceAccountPermsResolver],
  exports: [PermService]
})
export class PermsModule {}
