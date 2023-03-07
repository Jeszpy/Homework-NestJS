import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { checkSortDirection, toNumber } from '../helpers';

export enum BanStatusFilterEnum {
  All = 'all',
  Banned = 'banned',
  NotBanned = 'notBanned',
}

export class UserPaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => toNumber(value, { min: 1, default: 1 }))
  @IsNumber()
  pageNumber: number | null = 1;
  @IsOptional()
  @Transform(({ value }) => toNumber(value, { min: 1, default: 10 }))
  @IsNumber()
  pageSize: number | null = 10;
  @IsOptional()
  sortBy: string | null = 'createdAt';
  @IsOptional()
  @Transform(({ value }) => checkSortDirection(value))
  sortDirection: string | null = 'desc';
  @IsOptional()
  searchLoginTerm: string | null = null;
  @IsOptional()
  searchEmailTerm: string | null = null;
  // @IsEnum(BanStatusFilterEnum)
  @IsString()
  @IsOptional()
  banStatus: BanStatusFilterEnum = BanStatusFilterEnum.All;
}
