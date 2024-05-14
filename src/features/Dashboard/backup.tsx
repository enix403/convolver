import {
  useNumberInput,
  HStack,
  Button,
  Input,
  Text,
  SimpleGrid,
  Heading,
  Box,
  useColorMode
} from "@chakra-ui/react";
import { produce } from "immer";
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "~/components/AppLayout/AppLayout";
import { repeatNode } from "~/utils/control";

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

function useMatrixState() {
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

type MatrixState = ReturnType<typeof useMatrixState>;

function MatrixForm({
  title = "",
  state
}: {
  title?: string;
  state: MatrixState;
}) {
  const { numRows, setNumRows, numCols, setNumCols, dim, values, setValues } =
    state;

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

export function Dashboard() {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode("dark");
  }, []);

  let matrix = useMatrixState();
  let filter = useMatrixState();

  return (
    <AppLayout>
      <div className='p-4 pb-96'>
        <MatrixForm title='Matrix' state={matrix} />

        <hr className='my-7' />

        <MatrixForm title='Filter' state={filter} />

        <Button colorScheme='teal' mt='24px' className='max-md:w-full'>
          Convolve
        </Button>
      </div>
    </AppLayout>
  );
}
