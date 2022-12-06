interface ToNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}

export const toNumber = (value: string, opts: ToNumberOptions = {}): number => {
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

export const checkSortBy = (value: string): string => {
  const asc = 'asc';
  const desc = 'desc';
  return value === (asc || desc) ? value : desc;
};
