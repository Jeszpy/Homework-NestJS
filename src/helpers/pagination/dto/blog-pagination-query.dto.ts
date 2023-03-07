import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { checkSortDirection, toNumber } from '../helpers';

export class BlogPaginationQueryDto {
  @IsOptional()
  searchNameTerm: string | null = null;
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
}
