import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  private url = this.configService.get('POSTGRES_URI');

  private getUrl(): string {
    const env = this.configService.get('ENV_TYPE');
    switch (env) {
      case 'LOCAL':
        return this.configService.get('POSTGRES_LOCAL_URI');
      case 'DEV':
        return this.configService.get('POSTGRES_DEV_URI');
      default:
        return this.configService.get('POSTGRES_PRODUCTION_URI');
    }
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.getUrl(),
      // entities: [],
      // synchronize: true,
    };
  }
}
