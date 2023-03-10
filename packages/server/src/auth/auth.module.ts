import {HttpModule} from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { JwtStrategy } from './jwt.stretegy';

@Module({
  imports: [
    PassportModule,
    HttpModule,
    JwtModule.registerAsync({
      imports: [forwardRef(() => AuthModule)],
      inject: [AuthService],
      useFactory: async (authService: AuthService) => {
        return {
          publicKey: await authService.getPublicKey(),
          signOptions: {
            algorithm: 'RS256',
          }
        };
      }
    })
  ],
  providers: [
    AuthService,
    JwtAuthGuard,
    {
      provide: JwtStrategy,
      inject: [AuthService],
      useFactory: async (authService: AuthService) => {
        const key = await authService.getPublicKey();
        return new JwtStrategy(key);
      }
    }
  ],
  exports: [AuthService]
})
export class AuthModule {}
