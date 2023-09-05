import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CargoPermissions, CargoPermissionsDocument } from './perms.model';
import { CargoPermissionChange } from './perms.dto';
import { CargoResourceRequest } from '../sign/request.dto';
import { TokenPayload } from '../auth/user.dto';
import { isServiceAccount } from '../auth/service-account.guard';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { CargoAccountService } from 'src/account/account.service';
import { PublicService } from '../public/public.service';

@Injectable()
export class PermService {
  constructor(
    @InjectModel(CargoPermissions.name) private readonly permsModel: Model<CargoPermissionsDocument>,
    private readonly accountService: CargoAccountService,
    private readonly publicService: PublicService
  ) {}

  async find(id: mongoose.Types.ObjectId): Promise<CargoPermissions | null> {
    return this.permsModel.findById(id);
  }

  /**
   * Get the permissions currently stored for the given user based on the
   * buckets stored for the given project the user is a part of.
   */
  async getPermissions(user: TokenPayload): Promise<CargoPermissions[]> {
    const account = await this.accountService.findByProject(user.projectId);
    if (!account) {
      throw new BadRequestException(`No account associated with user ${user.id}`);
    }

    // Get the client
    const client = account.getS3Client();
    const listBuckets = await client.send(new ListBucketsCommand({}));
    if (!listBuckets.Buckets) {
      return [];
    }

    // Return all permissions
    return Promise.all(
      listBuckets.Buckets.filter((bucket) => bucket.Name !== undefined).map((bucket) =>
        this.getOrCreateDefault(user.id, user.projectId, bucket.Name!)
      )
    );
  }

  /**
   * Get all users with permissions for the given bucket
   */
  async getUsers(bucket: string): Promise<string[]> {
    const perms = await this.permsModel.find({ bucket: bucket }).exec();
    return perms.map((perm) => perm.user);
  }

  /**
   * Add a user to the system, create permissions for all buckets related to the user's project
   *
   * NOTE: In the future, it will not be required to manually add users
   */
  async addUser(user: string, project: string): Promise<CargoPermissions[]> {
    // Make sure the user doesn't already exist
    const existingUser = await this.permsModel.findOne({ user });
    if (existingUser) {
      throw new BadRequestException(`User ${user} already exists`);
    }

    const account = await this.accountService.findByProject(project);
    if (!account) {
      throw new BadRequestException(`No account found for project ${project}`);
    }
    const s3Client = account.getS3Client();

    // Get buckets from S3
    const listBuckets = await s3Client.send(new ListBucketsCommand({}));
    const buckets = listBuckets.Buckets;
    if (!buckets) {
      return [];
    }

    // For all buckets with names, make user permissions for that bucket
    return Promise.all(
      buckets.filter((bucket) => bucket.Name !== undefined).map((bucket) => this.getOrCreateDefault(user, project, bucket.Name!))
    );
  }

  async getPermissionsForBucket(user: TokenPayload, bucket: string): Promise<CargoPermissions | null> {
    return this.getOrCreateDefault(user.id, user.projectId, bucket);
  }

  async getAllBucketPermissions(bucket: string): Promise<CargoPermissions[]> {
    // TODO: Handle the public buckets
    return this.permsModel.find({ bucket: bucket }).exec();
  }

  async changePermissions(
    user: string,
    bucket: string,
    perms: CargoPermissionChange
  ): Promise<CargoPermissions | null> {
    return this.permsModel.findOneAndUpdate({ user: user, bucket: bucket }, perms, { new: true }).exec();
  }

  async hasAccess(user: TokenPayload, resource: CargoResourceRequest): Promise<boolean> {
    const bucket = resource.path.split('/')[1];
    const object = resource.path.split('/').slice(2).join('/');

    // No bucket specified, handle account level access control
    if (!bucket) {
      return this.accountLevelAccess(user, resource);
    }

    // Get user permissions
    const userPerms = await this.getOrCreateDefault(user.id, user.projectId, bucket);

    // Only bucket specified, handle bucket level access control
    if (bucket && object.length == 0) {
      return this.bucketLevelAccess(user, resource, userPerms);
    }

    return this.objectLevelAccess(user, resource, userPerms);
  }

  private async accountLevelAccess(_user: TokenPayload, resource: CargoResourceRequest): Promise<boolean> {
    // All users can list buckets
    if (resource.method === 'GET') {
      return true;
    }

    throw new BadRequestException(`Unsupported request operation ${resource.method} for ${resource.path}`);
  }

  private async bucketLevelAccess(
    user: TokenPayload,
    resource: CargoResourceRequest,
    userPerms: CargoPermissions
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
    resource: CargoResourceRequest,
    userPerms: CargoPermissions
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

  /**
   * Get the user permissions on the given bucket. If no permissions exist for
   * the user, then the default permissions are created for the user and
   * returned.
   */
  private async getOrCreateDefault(user: string, project: string, bucket: string): Promise<CargoPermissions> {
    // Determine if the bucket is public
    const bucketIsPublic = await this.publicService.isPublic(bucket, project);

    const perms = await this.permsModel.findOne({ user: user, bucket: bucket });
    if (perms) {
      // Change perms based on if the bucket is public
      if (bucketIsPublic && !perms.read) {
        await this.permsModel.updateOne({ _id: perms._id }, { $set: { read: true }});
      }
      return (await this.permsModel.findOne({ _id: perms._id }))!;
    }

    return this.permsModel.create({
      user: user,
      bucket: bucket,
      read: bucketIsPublic,
      write: false,
      delete: false,
      admin: false
    });
  }
}
