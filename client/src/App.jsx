/* global BigInt */

import React, { useState, useEffect } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from "./Header";
import { useMoralis } from "react-moralis";
import Main from "./Main"

const supportedChains = ["31337", "4"];

const theme = createTheme({
  palette: {
      primary: {
          main: "#000000",
          light: "#b3ebbb"
      },
      inverse: {
          main: "#ffffff",
          light: "#b3ebbb",
          contrastText: "#19ac2c"
      }
  },
  components: {
      MuiButtonBase: {
          defaultProps: {
              variant: "Outlined"
          },
      },
  }
});

function App() {

  const { isWeb3Enabled, chainId } = useMoralis();

  return (
    <ThemeProvider theme={theme}>
    <div>
      <Header />
      {isWeb3Enabled ? (
        <div>
          {supportedChains.includes(parseInt(chainId).toString()) ? (
            <div className="flex flex-row">
              <Main />
            </div>
          ) : (
            <div>{`Please switch to a supported chainId. The supported Chain Ids are: ${supportedChains}`}</div>
          )}
        </div>
      ) : (<div></div>)}
    </div>
    </ThemeProvider>
  );
}

export default App;
