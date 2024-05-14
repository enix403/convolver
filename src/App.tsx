import "./App.css";

import '@fontsource/poppins/100.css';
import '@fontsource/poppins/200.css';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/900.css';

import {
  ChakraProvider,
  // StyleFunctionProps,
  ThemeConfig,
  extendTheme
} from "@chakra-ui/react";

import { Convolver } from './convolver/Convolver';

const theme = extendTheme({
  initialColorMode: 'dark',
  useSystemColorMode: false,
  fonts: {
    heading: 'Poppins',
    body: 'Poppins',
  },
  // styles: {
  //   global: (props: StyleFunctionProps) => ({
  //     body: {
  //       fontFamily: "Fira Code",
  //       fontWeight: 500
  //     },
  //   })
  // }
} as ThemeConfig);

export default function App() {
  return (
    <ChakraProvider theme={theme} resetCSS={false}>
      <Convolver />
    </ChakraProvider>
  );
}
