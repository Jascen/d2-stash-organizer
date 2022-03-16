// PD2 stash is 15 rows high instead of 10
export const PAGE_HEIGHT = 15;
export const PAGE_WIDTH = 10;

export const ALL_ROWS = Array(PAGE_HEIGHT)
  .fill(0)
  .map((_, i) => i);
export const ALL_COLUMNS = Array(PAGE_WIDTH)
  .fill(0)
  .map((_, i) => i);
