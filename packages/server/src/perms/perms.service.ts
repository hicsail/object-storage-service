import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permissions, PermissionsDocument } from './perms.model';
import { ProjectService } from '../project/project.service';
import { PermissionChange } from './perms.dto';

@Injectable()
export class PermService {
  constructor(
    @InjectModel(Permissions.name) private readonly permsModel: Model<PermissionsDocument>,
    private readonly projectService: ProjectService
  ) {}

  /**
   * Get the permissions currently stored for the given user based on the
   * buckets stored for the given project the user is a part of.
   */
  async getPermissions(user: string): Promise<Permissions[]> {
    // Find current permissions
    return this.permsModel.find({ user: user }).exec();
  }

  /**
   * Get all users with permissions for the given bucket
   */
  async getUsers(bucket: string): Promise<string[]> {
    const perms = await this.permsModel.find({ bucket: bucket }).exec();
    return perms.map((perm) => perm.user);
  }

  /** Add a user to the system, create permissions for all buckets related to the user's project */
  async addUser(user: string, project: string) {
    // Make sure the user doesn't already exist
    const existingUser = await this.permsModel.findOne({ user: user });
    if (existingUser) {
      throw new BadRequestException(`User ${user} already exists`);
    }

    const buckets = await this.projectService.getBuckets(project);
    return await Promise.all(buckets.map((bucket) => this.makePermissions(user, bucket)));
  }

  async getPermissionsForBucket(user: string, bucket: string): Promise<Permissions | null> {
    return this.permsModel.findOne({ user: user, bucket: bucket }).exec();
  }

  async getAllBucketPermissions(bucket: string): Promise<Permissions[]> {
    return this.permsModel.find({ bucket: bucket }).exec();
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

  async changePermissions(user: string, bucket: string, perms: PermissionChange): Promise<Permissions | null> {
    return this.permsModel.findOneAndUpdate({ user: user, bucket: bucket }, perms, { new: true }).exec();
  }
}
