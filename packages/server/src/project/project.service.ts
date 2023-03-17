import { BadRequestException, forwardRef, Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { PermService } from '../perms/perms.service';
import { Project, ProjectDocument } from './project.model';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @Inject(forwardRef(() => PermService)) private permService: PermService
  ) {}

  async find(id: mongoose.Types.ObjectId): Promise<Project | null> {
    return this.projectModel.findById(id);
  }

  async create(project: string): Promise<Project> {
    const createdProject = new this.projectModel({ project, buckets: [] });
    return createdProject.save();
  }

  async getBuckets(project: string): Promise<string[]> {
    const existingProject = await this.projectModel.findOne({ project });
    if (!existingProject) {
      throw new BadRequestException(`Project ${project} does not exist`);
    }
    return existingProject.buckets;
  }

  async getProjectForBucket(bucket: string): Promise<string | null> {
    const result = await this.projectModel.findOne({ buckets: bucket });
    return result ? result.project : null;
  }

  /**
   * Add a bucket to a project, will throw an error if the project doesn't
   * exist or the bucket is already attached to the project
   */
  async addBucket(project: string, bucket: string): Promise<Project> {
    // Get the project, ensure it exists, and the bucket name is unique
    let existingProject: Project | null = await this.projectModel.findOne({ project }).exec();
    if (!existingProject) {
      existingProject = await this.create(project);
    }
    if (existingProject.buckets.includes(bucket)) {
      throw new BadRequestException(`Bucket ${bucket} already exists for project ${project}`);
    }

    // Add the bucket
    existingProject.buckets.push(bucket);
    await this.projectModel.findOneAndUpdate({ project }, existingProject, { new: false });

    // Make new user permissions for the bucket
    if (existingProject.buckets.length > 0) {
      const users = await this.permService.getUsers(existingProject.buckets[0]);
      await Promise.all(users.map((user) => this.permService.makePermissions(user, bucket)));
    }

    return existingProject;
  }
}
