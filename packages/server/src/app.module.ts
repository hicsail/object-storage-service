import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PermsModule } from './perms/perms.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { SignModule } from './sign/sign.module';
import { AuthModule } from './auth/auth.module';
import { CargoAccountModule } from './account/account.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [
    PermsModule,
    SignModule,
    AuthModule,
    CargoAccountModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('mongo.uri')
      })
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      autoSchemaFile: {
        federation: 2,
        path: 'schema.gql'
      },
      driver: ApolloFederationDriver
    }),
    PublicModule
  ],
  providers: [AppService]
})
export class AppModule {}
