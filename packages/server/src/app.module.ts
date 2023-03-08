import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PermsModule } from './perms/perms.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ProjectModule } from './project/project.module';
import { SignModule } from './sign/sign.module';

@Module({
  imports: [
    PermsModule,
    ProjectModule,
    SignModule,
    ConfigModule.forRoot({
      load: [configuration]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('mongo.uri')
      })
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      driver: ApolloDriver
    })
  ],
  providers: [AppService]
})
export class AppModule {}
