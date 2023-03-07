import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permissions, PermissionsDocument } from './perms.model';
import { User } from '../auth/user.dto';
import { ProjectService } from '../project/project.service';

@Injectable()
export class PermService {
  constructor(@InjectModel(Permissions.name) private readonly permsModel: Model<PermissionsDocument>,
              private readonly projectService: ProjectService) {}

  /**
   * Get the permissions currently stored for the given user based on the
   * buckets stored for the given project the user is a part of.
   */
  async getPermissions(user: User): Promise<Permissions[]> {
    // Find current permissions
    const buckets = await this.projectService.getBuckets(user.projectId);
    return await this.permsModel.find({ user: user.id, bucket: { $in: buckets } }).exec();
  }

  /**
   * Get all users with permissions for the given bucket
   */
  async getUsers(bucket: string): Promise<string[]> {
    const perms = await this.permsModel.find({ bucket: bucket }).exec();
    return perms.map(perm => perm.user);
  }

  /** Add a user to the system, create permissions for all buckets */
  async addUser(user: string, project: string) {
    const buckets = await this.projectService.getBuckets(project);
    return await Promise.all(buckets.map(bucket => this.makePermissions(user, bucket)));
  }

  /**
   * Make permissions for the given user for the given bucket. Defaults to
   * no access
   */
  async makePermissions(user: string, bucket: string): Promise<Permissions> {
    return this.permsModel.create({
      user: user,
      bucket: bucket,
      read: false,
      write: false,
      delete: false,
      admin: false
    });
  }

}
