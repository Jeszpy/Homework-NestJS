import { Injectable } from '@nestjs/common';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ThrottlerConfig implements ThrottlerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  private ttl = parseInt(this.configService.get('THROTTLE_TTL'), 10);
  private limit = parseInt(this.configService.get('THROTTLE_LIMIT'), 10);

  createThrottlerOptions(): ThrottlerModuleOptions {
    return {
      ttl: this.ttl,
      limit: this.limit,
    };
  }
}
