import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

interface ToNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}

const toNumber = (value: string, opts: ToNumberOptions = {}): number => {
  let newValue: number = Number.parseInt(value || String(opts.default), 10);

  if (Number.isNaN(newValue)) {
    newValue = opts.default;
  }

  if (opts.min) {
    if (newValue < opts.min) {
      newValue = opts.min;
    }

    if (newValue > opts.max) {
      newValue = opts.max;
    }
  }

  return newValue;
};

const checkSortBy = (value: string): string => {
  const asc = 'asc';
  const desc = 'desc';
  return value === (asc || desc) ? value : desc;
};

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
