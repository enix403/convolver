import { flushSync } from "react-dom";
import {
  useNumberInput,
  HStack,
  Button,
  Input,
  Heading,
  useColorMode,
  FormControl,
  FormLabel,
  Select,
  useToast,
  RadioGroup,
  Stack,
  Radio,
  Textarea
} from "@chakra-ui/react";
import { produce } from "immer";
import { useEffect, useState } from "react";

import { repeatNode } from "./utils";
import {
  Matrix,
  Padding,
  PaddingAdjustment,
  applyPadding,
  convolve
} from "./algebra";

// The maximum allowed dimension of a matrix (rows or columns)
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
    <HStack maxW='320px' className='font-semibold'>
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

function toInt(value: any) {
  let asNum = +value;
  if (isNaN(asNum)) asNum = 0;
  if (!isFinite(asNum)) asNum = 0;

  asNum = Math.floor(asNum);

  return asNum;
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

  const [inputMode, setInputMode] = useState<"cells" | "raw">("cells");

  const [rawValue, setRawValue] = useState("");

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

  function handleBlur() {
    let linesStr = rawValue
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

    let lines = linesStr.map(line => {
      let lineWords = line
        .split(" ")
        .map(word => word.trim())
        .filter(Boolean);
      return lineWords;
    });

    let rawRows = Math.min(lines.length, MAX_DIM);
    let rawCols = Math.min(
      Math.max(...lines.map(line => line.length)),
      MAX_DIM
    );

    let subValues: string[][] = [];
    let colSizes = new Array(rawCols).fill(0);

    for (let row = 0; row < rawRows; ++row) {
      let rowData = lines[row];
      let subValueRow: string[] = [];
      for (let col = 0; col < rawCols; ++col) {
        let value = col < rowData.length ? toInt(rowData[col]).toString() : "0";
        subValueRow.push(value);

        if (value.length > colSizes[col])
          //
          colSizes[col] = value.length;
      }
      subValues.push(subValueRow);
    }

    let formattedRawValue = subValues
      .map(row => row.map((val, col) => val.padStart(colSizes[col])).join(" "))
      .join("\n");

    flushSync(() => {
      setNumRows(rawRows);
      setNumCols(rawCols);
    });

    setValues(
      produce(draft => {
        for (let row = 0; row < rawRows; ++row) {
          for (let col = 0; col < rawCols; ++col) {
            draft[row][col] = subValues[row][col];
          }
        }
      })
    );

    setRawValue(formattedRawValue);
  }

  return (
    <div>
      {title && (
        <Heading size='lg' mb='10px'>
          {title}
        </Heading>
      )}

      <RadioGroup value={inputMode} onChange={setInputMode as any} my='24px'>
        <Stack spacing={5} align='center' direction='row'>
          <FormLabel fontWeight='bold' m='0'>
            Input Mode
          </FormLabel>
          <Radio size='lg' colorScheme='blue' value='cells'>
            Cells
          </Radio>
          <Radio size='lg' colorScheme='green' value='raw'>
            Raw Data
          </Radio>
        </Stack>
      </RadioGroup>

      {inputMode === "cells" ? (
        <>
          <p className='mb-2'>Number of rows</p>
          <DimensionInput value={numRows} onChange={setNumRows} />

          <p className='mb-2 mt-6'>Number of columns</p>
          <DimensionInput value={numCols} onChange={setNumCols} />

          <div className='max-w-none overflow-x-auto pb-6 font-semibold'>
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
                    size='lg'
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
        </>
      ) : (
        <>
          <Textarea
            value={rawValue}
            h='200px'
            className='font-mono'
            onBlur={handleBlur}
            onChange={event => setRawValue(event.target.value)}
            placeholder={MATRIX_RAW_PLACEHOLDER}
          />
        </>
      )}
    </div>
  );
}

const MATRIX_RAW_PLACEHOLDER = `
Enter matrix. e.g

4 1 8
2 9 0
7 2 4

`.trim();

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

export function Convolver() {
  useApplyDarkMode();
  const toast = useToast();

  let matrixState = useMatrixFormState();
  let filterState = useMatrixFormState();

  let [padding, setPadding] = useState(Padding.None);
  let [paddingAdj, setPaddingAdj] = useState(PaddingAdjustment.FloorStart);

  let [result, setResult] = useState<Matrix | null>(null);

  function handleConvolve() {
    let matrix = formStateToMatrix(matrixState);
    let filter = formStateToMatrix(filterState);

    if (matrix.rows < filter.rows || matrix.cols < filter.cols) {
      toast({
        title: "Invalid size.",
        description: "Matrix is smaller than the filter.",
        status: "error",
        duration: 4000,
        isClosable: true
      });
      return;
    }

    matrix = applyPadding(matrix, filter.size(), padding, paddingAdj);
    let result = convolve(matrix, filter);
    setResult(result);
  }

  return (
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
                  className='h-8 min-w-8 rounded bg-white/10 p-0.5 px-1'
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
  );
}
