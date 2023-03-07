import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './project.model';
import { ProjectService } from './project.service';
import { ProjectResolver } from './project.resolver';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }])
  ],
  providers: [ProjectService, ProjectResolver]
})
export class ProjectModule {}
