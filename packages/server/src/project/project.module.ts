import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './project.model';
import { ProjectService } from './project.service';
import { ProjectResolver } from './project.resolver';
import { PermsModule } from '../perms/perms.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]), forwardRef(() => PermsModule)],
  providers: [ProjectService, ProjectResolver],
  exports: [ProjectService]
})
export class ProjectModule {}
