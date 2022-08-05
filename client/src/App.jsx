import React, {useEffect} from "react";
import Main from "./components/Main";
import web3 from "./utilities/web3";
import {loadContract} from "./utilities/contract";
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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

  useEffect(() => {
    (async () => {
      await web3;
      await loadContract();
    })();
  }, []);
  
  return (
      <ThemeProvider theme={theme}>
        <Main />
        <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
      </ThemeProvider>);
}

export default App;
