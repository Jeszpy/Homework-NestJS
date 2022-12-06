import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { checkSortBy, toNumber } from '../helpers';

export class PostPaginationQueryDto {
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
  @Transform(({ value }) => checkSortBy(value))
  sortDirection: string | null = 'desc';
}
