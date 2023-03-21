import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CargoAccount, CargoAccountDocument } from './account.model';

@Injectable()
export class CargoAccountService {
  constructor(@InjectModel(CargoAccount.name) private readonly accountModel: Model<CargoAccountDocument>) {}

  async find(id: mongoose.Types.ObjectId): Promise<CargoAccount | null> {
    return this.accountModel.findById(id);
  }

  async findByProject(project: string): Promise<CargoAccount | null> {
    return this.accountModel.findOne({ project });
  }
}
