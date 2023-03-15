import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permissions, PermissionsDocument } from './perms.model';
import { ProjectService } from '../project/project.service';
import { PermissionChange } from './perms.dto';
import { ResourceRequest } from '../sign/request.dto';
import { TokenPayload } from '../auth/user.dto';
import { isServiceAccount } from '../auth/service-account.guard';

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

  async hasAccess(user: TokenPayload, resource: ResourceRequest): Promise<boolean> {
    const bucket = resource.path.split('/')[1];
    const object = resource.path.split('/').slice(2).join('/');

    // No bucket specified, handle account level access control
    if (!bucket) {
      return this.accountLevelAccess(user, resource);
    }

    // Get user permissions
    const userPerms = await this.permsModel.findOne({ user: user.id, bucket });
    if (!userPerms) {
      throw new UnauthorizedException('User not granted access');
    }

    // Only bucket specified, handle bucket level access control
    if (bucket && object.length == 0) {
      return this.bucketLevelAccess(user, resource, userPerms);
    }

    return this.objectLevelAccess(user, resource, userPerms);
  }

  private async accountLevelAccess(_user: TokenPayload, resource: ResourceRequest): Promise<boolean> {
    // All users can list buckets
    if (resource.method === 'GET') {
      return true;
    }

    throw new BadRequestException(`Unsupported request operation ${resource.method} for ${resource.path}`);
  }

  private async bucketLevelAccess(
    user: TokenPayload,
    resource: ResourceRequest,
    userPerms: Permissions
  ): Promise<boolean> {
    // User needs read access to list contents of the bucket
    if (resource.method === 'GET') {
      return userPerms.read;
    }

    // Only service accounts can make buckets
    if (resource.method === 'PUT') {
      return isServiceAccount(user);
    }

    // Only service accounts can modify bucket metadata
    if (resource.method === 'POST') {
      return isServiceAccount(user);
    }

    // Only service accounts can delete buckets
    if (resource.method === 'DELETE') {
      return isServiceAccount(user);
    }

    throw new BadRequestException(`Unsupported request operations ${resource.method} for ${resource.path}`);
  }

  private async objectLevelAccess(
    user: TokenPayload,
    resource: ResourceRequest,
    userPerms: Permissions
  ): Promise<boolean> {
    // User needs read to get the file
    if (resource.method === 'GET') {
      return userPerms.read || isServiceAccount(user);
    }

    // User needs read to get object metadata
    if (resource.method === 'HEAD') {
      return userPerms.read || isServiceAccount(user);
    }

    // User needs write to upload object
    // TODO: What about overwritting?
    if (resource.method === 'PUT') {
      return userPerms.write || isServiceAccount(user);
    }

    // User needs write to modify metadata
    if (resource.method === 'POST') {
      return userPerms.write || isServiceAccount(user);
    }

    // User needs delete to remove an object
    if (resource.method === 'DELETE') {
      return userPerms.delete || isServiceAccount(user);
    }

    throw new BadRequestException(`Unsupported request operations ${resource.method} for ${resource.path}`);
  }
}
