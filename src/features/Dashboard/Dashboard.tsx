import {
  useNumberInput,
  HStack,
  Button,
  Input,
  Heading,
  useColorMode,
  FormControl,
  FormLabel,
  Select
} from "@chakra-ui/react";
import { produce } from "immer";
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "~/components/AppLayout/AppLayout";
import { repeatNode } from "~/utils/control";
import {
  Matrix,
  Padding,
  PaddingAdjustment,
  applyPadding,
  convolve
} from "./algebra";

let MAX_DIM = 20;

function DimensionInput({ value, onChange }) {
  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
    useNumberInput({
      step: 1,
      min: 1,
      max: MAX_DIM,
      precision: 0,
      value,
      onChange(_valueAsString, valueAsNumber) {
        onChange(valueAsNumber);
      }
    });

  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();
  const input = getInputProps();

  return (
    <HStack maxW='320px'>
      <Button {...dec}>-</Button>
      <Input {...input} />
      <Button {...inc}>+</Button>
    </HStack>
  );
}

function useMatrixFormState() {
  const [numRows, setNumRows] = useState(3);
  const [numCols, setNumCols] = useState(3);

  const dim = {
    rows:
      typeof numRows === "number" && !isNaN(numRows) ? Math.max(1, numRows) : 1,
    cols:
      typeof numCols === "number" && !isNaN(numCols) ? Math.max(1, numCols) : 1
  };

  const [values, setValues] = useState(() => {
    let grid: string[][] = [];
    for (let i = 0; i < MAX_DIM; ++i) {
      let row: string[] = [];
      for (let j = 0; j < MAX_DIM; ++j) row.push("0");
      grid.push(row);
    }

    return grid;
  });

  /* useEffect(() => {
    setValues(
      produce(draft => {
        for (let row = dim.rows; row < MAX_DIM; ++row)
          for (let col = 0; col < MAX_DIM; ++col)
            //
            draft[row][col] = "0";
        for (let col = dim.cols; col < MAX_DIM; ++col)
          for (let row = 0; row < MAX_DIM; ++row)
            //
            draft[row][col] = "0";
      })
    );
  }, [dim.rows, dim.cols]); */

  return {
    numRows,
    setNumRows,
    numCols,
    setNumCols,
    dim,
    values,
    setValues
  };
}

type MatrixFormState = ReturnType<typeof useMatrixFormState>;

function MatrixForm({
  title = "",
  formState
}: {
  title?: string;
  formState: MatrixFormState;
}) {
  const { numRows, setNumRows, numCols, setNumCols, dim, values, setValues } =
    formState;

  function loc(index: number) {
    let row = Math.floor(index / dim.cols);
    let col = index % dim.cols;

    return { row, col };
  }

  function update(row: number, col: number, value: string) {
    setValues(
      produce(draft => {
        draft[row][col] = value;
      })
    );
  }

  return (
    <div>
      {title && (
        <Heading size='lg' mb='10px'>
          {title}
        </Heading>
      )}

      <p>Number of rows</p>
      <DimensionInput value={numRows} onChange={setNumRows} />

      <p className='mt-6'>Number of columns</p>
      <DimensionInput value={numCols} onChange={setNumCols} />

      <div className='max-w-none overflow-x-auto pb-6'>
        <div
          className='mt-6 inline-grid gap-2'
          style={{
            gridTemplateColumns: `repeat(${dim.cols},1fr)`
          }}
        >
          {repeatNode(dim.cols * dim.rows, index => {
            let { row, col } = loc(index);
            return (
              <Input
                key={`${row},${col}`}
                flexShrink={0}
                minWidth='70px'
                width='70px'
                variant='outline'
                borderColor='black'
                borderWidth={2}
                value={values[row][col]}
                onChange={event => update(row, col, event.target.value)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function toInt(value: any) {
  let asNum = +value;
  if (isNaN(asNum)) asNum = 0;
  if (!isFinite(asNum)) asNum = 0;

  asNum = Math.floor(asNum);

  return asNum;
}

function formStateToMatrix(state: MatrixFormState) {
  let { rows, cols } = state.dim;
  let matrix = new Matrix(rows, cols);

  for (let i = 0; i < rows; ++i)
    for (let j = 0; j < cols; ++j)
      matrix.setEntry(i, j, toInt(state.values[i][j]));

  return matrix;
}

function useApplyDarkMode() {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode("dark");
  }, []);
}

export function Dashboard() {
  useApplyDarkMode();

  let matrixState = useMatrixFormState();
  let filterState = useMatrixFormState();

  let [padding, setPadding] = useState(Padding.None);
  let [paddingAdj, setPaddingAdj] = useState(PaddingAdjustment.FloorStart);

  let [result, setResult] = useState<Matrix | null>(null);

  function handleConvolve() {
    let matrix = formStateToMatrix(matrixState);
    let filter = formStateToMatrix(filterState);

    matrix = applyPadding(matrix, filter.size(), padding, paddingAdj);
    let result = convolve(matrix, filter);
    setResult(result);

    // let matrix = formStateToMatrix(matrixState);
    // matrix = applyPadding(matrix, Padding.Zero, {
    //   rowsStart: 0,
    //   rowsEnd: 2,
    //   colsStart: 2,
    //   colsEnd: 1
    // });
  }

  return (
    <AppLayout>
      <div className='p-4 pb-96'>
        <MatrixForm title='Matrix' formState={matrixState} />

        <hr className='my-7' />

        <MatrixForm title='Filter' formState={filterState} />

        <hr className='my-7' />

        <FormControl className='md:max-w-[400px]'>
          <FormLabel fontWeight='bold'>Padding</FormLabel>
          <Select
            value={padding}
            onChange={event => setPadding(+event.target.value as any)}
          >
            <option value={Padding.None}>None</option>
            <option value={Padding.Zero}>Zero</option>
            <option value={Padding.Same}>Same</option>
          </Select>
        </FormControl>

        <FormControl mt='16px' className='md:max-w-[400px]'>
          <FormLabel fontWeight='bold'>Padding Adjustment</FormLabel>
          <Select
            value={paddingAdj}
            onChange={event => setPaddingAdj(+event.target.value as any)}
          >
            <option value={PaddingAdjustment.FloorStart}>Floor Start</option>
            <option value={PaddingAdjustment.CeilStart}>Ceil Start</option>
          </Select>
        </FormControl>

        <Button
          onClick={handleConvolve}
          colorScheme='teal'
          mt='24px'
          className='w-48 max-md:w-full'
        >
          Convolve
        </Button>
        {result && (
          <>
            <hr className='my-7' />

            <Heading size='lg' mb='10px'>
              Result
            </Heading>

            <div className='overflow-x-auto py-8'>
              <div
                className='inline-grid gap-1 gap-x-5 px-8 font-mono'
                style={{
                  gridTemplateColumns: `repeat(${result.cols},1fr)`
                }}
              >
                {repeatNode(result.rows * result.cols, index => (
                  <div
                    key={index}
                    className='h-8 w-8 rounded bg-white/10 p-0.5'
                  >
                    <p className='text-right text-lg font-semibold'>
                      {result.getEntryIndexed(index)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
