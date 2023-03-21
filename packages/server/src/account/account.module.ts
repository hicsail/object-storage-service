import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CargoAccount, CargoAccountSchema } from './account.model';
import { CargoAccountService } from './account.service';

@Module({
  imports: [ MongooseModule.forFeature([{ name: CargoAccount.name, schema: CargoAccountSchema }]) ],
  providers: [CargoAccountService],
})
export class CargoAccountModule {}
