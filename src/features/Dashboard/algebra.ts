export interface MatrixSize {
  rows: number;
  cols: number;
}

export class Matrix {
  public readonly rows: number;
  public readonly cols: number;

  private data: number[];

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;

    this.data = new Array(rows * cols).fill(0);
  }

  public getEntry(row: number, col: number) {
    let index = row * this.cols + col;
    return this.data[index];
  }

  public getEntryIndexed(index: number) {
    return this.data[index];
  }

  public setEntry(row: number, col: number, value: number) {
    let index = row * this.cols + col;
    this.data[index] = value;
  }

  public size(): MatrixSize {
    return { rows: this.rows, cols: this.cols };
  }
}

function subConvolve(a: Matrix, b: Matrix, startRow: number, startCol: number) {
  let sum = 0;

  for (let row = 0; row < b.rows; ++row)
    for (let col = 0; col < b.cols; ++col)
      //
      sum += a.getEntry(startRow + row, startCol + col) * b.getEntry(row, col);

  return sum;
}

export const enum Padding {
  None,
  Zero,
  Same
}

export const enum PaddingAdjustment {
  FloorStart,
  CeilStart
}

function fillSubMatrix(
  matrix: Matrix,
  startRow: number,
  numRows: number,
  startCol: number,
  numCols: number,
  valueMaker: (row: number, col: number) => number
) {
  for (let row = 0; row < numRows; ++row) {
    for (let col = 0; col < numCols; ++col) {
      let realRow = startRow + row;
      let realCol = startCol + col;
      matrix.setEntry(realRow, realCol, valueMaker(realRow, realCol));
    }
  }
}

interface PadSize {
  rowsStart: number;
  rowsEnd: number;
  colsStart: number;
  colsEnd: number;
}

function applyPaddingOfSize(
  matrix: Matrix,
  padding: Padding,
  size: PadSize
  // filterSize: MatrixSize,
  // adj: PaddingAdjustment
) {
  let { rowsStart, rowsEnd, colsStart, colsEnd } = size;

  let padded = new Matrix(
    matrix.rows + rowsStart + rowsEnd,
    matrix.cols + colsStart + colsEnd
  );

  // copy the matrix values
  fillSubMatrix(
    padded,
    rowsStart,
    matrix.rows,
    colsStart,
    matrix.cols,
    (row, col) => matrix.getEntry(row - rowsStart, col - colsStart)
  );

  let padMaker = () => 0;

  // prettier-ignore
  {
    fillSubMatrix(padded, 0, rowsStart, 0, padded.cols, padMaker);
    fillSubMatrix(padded, matrix.rows + rowsStart, rowsEnd, 0, padded.cols, padMaker);
    fillSubMatrix(padded, 0, padded.rows, 0, colsStart, padMaker);
    fillSubMatrix(padded, 0, padded.rows, matrix.cols + colsStart, colsEnd, padMaker);
  }

  return padded;
}

export function applyPadding(
  matrix: Matrix,
  filterSize: MatrixSize,
  padding: Padding,
  adj: PaddingAdjustment
) {
  if (padding == Padding.None) {
    return matrix;
  }

  let adjuster = adj === PaddingAdjustment.FloorStart ? Math.floor : Math.ceil;

  let padRows = filterSize.rows - 1;
  let rowsStart = adjuster(padRows / 2);
  let rowsEnd = padRows - rowsStart;

  let padCols = filterSize.cols - 1;
  let colsStart = adjuster(padCols / 2);
  let colsEnd = padCols - colsStart;

  return applyPaddingOfSize(matrix, padding, {
    rowsStart,
    rowsEnd,
    colsStart,
    colsEnd
  });
}

export function convolve(a: Matrix, b: Matrix) {
  let res = new Matrix(a.rows - b.rows + 1, a.cols - b.cols + 1);

  for (let row = 0; row < res.rows; ++row) {
    for (let col = 0; col < res.cols; ++col) {
      let value = subConvolve(a, b, row, col);
      res.setEntry(row, col, value);
    }
  }

  return res;
}
