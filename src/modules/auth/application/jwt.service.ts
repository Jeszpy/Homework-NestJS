import { UserQueryRepositoryMongodb } from '../../user/infrastructure/user-query.repository.mongodb';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import configuration from '../../../config/configuration';

@Injectable()
export class JwtService {
  constructor(
    private readonly configService: ConfigService, // private readonly userQueryRepository: UserQueryRepositoryMongodb,
  ) {}

  private accessTokenSecretKey = this.configService.get<string>(
    'ACCESS_TOKEN_SECRET',
  );

  private accessTokenLifeTime = this.configService.get<string>(
    'ACCESS_TOKEN_LIFE_TIME',
  );

  private refreshTokenSecretKey = this.configService.get<string>(
    'REFRESH_TOKEN_SECRET',
  );
  private refreshTokenLifeTime = this.configService.get<string>(
    'REFRESH_TOKEN_LIFE_TIME',
  );

  async signAccessToken(userId: string, deviceId = '123'): Promise<string> {
    return jwt.sign({ userId, deviceId }, this.accessTokenSecretKey, {
      expiresIn: this.accessTokenLifeTime,
    });
  }

  async verifyAccessToken(accessToken: string): Promise<any> {
    try {
      return jwt.verify(accessToken, this.accessTokenSecretKey);
    } catch (e) {
      return null;
    }
  }

  getPayloadFromAccessToken(accessToken: string): any {
    try {
      return jwt.decode(accessToken);
    } catch (e) {
      return null;
    }
  }

  verifyRefreshToken(refreshToken: string): any {
    try {
      return jwt.verify(refreshToken, this.refreshTokenSecretKey);
    } catch (e) {
      return null;
    }
  }

  async signAccessAndRefreshTokenToken(userId: string, deviceId: string) {
    const accessToken = jwt.sign(
      { userId, deviceId },
      this.accessTokenSecretKey,
      {
        expiresIn: this.accessTokenLifeTime,
      },
    );
    const refreshToken = jwt.sign(
      { userId, deviceId },
      this.refreshTokenSecretKey,
      {
        expiresIn: this.refreshTokenLifeTime,
      },
    );
    return { accessToken, refreshToken };
  }

  async getIssuedAtFromRefreshToken(token: string): Promise<string> {
    const payload: any = await jwt.decode(token);
    return new Date(payload.iat * 1000).toISOString();
  }
}
