import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permissions, PermissionsDocument } from './perms.model';
import { User } from '../auth/user.dto';

@Injectable()
export class PermService {
  constructor(@InjectModel(Permissions.name) private readonly permsModel: Model<PermissionsDocument>) {}

  /**
   * Get the permissions currently stored for the given user based on the
   * buckets stored for the given project the user is a part of.
   *
   * This will also check to make sure user permissions data is stored for
   * the user for the given projectId. If user permissions data is missing,
   * then a new entry with no permissions will be added and returned from
   * this call.
   */
  async getPermissions(user: User): Promise<Permissions[]> {
    const projectId = user.projectId;
    return [];
  }
}
