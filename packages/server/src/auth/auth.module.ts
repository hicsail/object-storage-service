import { JwtModule } from '@nestjs/jwt';
import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [forwardRef(() => AuthModule)],
      inject: [AuthService],
      useFactory: async (authService: AuthService) => {
        return {
          publicKey: await authService.getPublicKey(),
          signOptions: {
            algorithm: 'RS256'
          }
        };
      }
    })
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: JwtStrategy,
      inject: [AuthService],
      useFactory: async (authService: AuthService) => {
        return new JwtStrategy(await authService.getPublicKey());
      }
    }
  ],
  exports: [AuthService]
})
export class AuthModule {}
