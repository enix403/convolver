import "./App.css";

import "unfonts.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  ChakraProvider,
  StyleFunctionProps,
  ThemeConfig,
  extendTheme
} from "@chakra-ui/react";

import { Dashboard } from "./features/Dashboard/Dashboard";

const theme = extendTheme({
  initialColorMode: 'dark',
  useSystemColorMode: false,
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        fontFamily: ""
      }
    })
  }
} as ThemeConfig);

export default function App() {
  return (
    <ChakraProvider theme={theme} resetCSS={false}>
      <BrowserRouter>
        <Routes>
          <Route path='/' Component={Dashboard} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}