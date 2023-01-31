const calculatePagesCount = (totalCount: number, pageSize: number) => {
  const result = Math.ceil(totalCount / pageSize);
  return result === 0 ? 1 : result;
};

export class PaginationViewModel<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;

  constructor(totalCount: number, page: number, pageSize: number, items: T) {
    this.pagesCount = calculatePagesCount(totalCount, pageSize);
    this.page = page;
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.items = items;
  }
}
