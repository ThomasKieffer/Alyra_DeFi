/* global BigInt */

import React, { useState, useEffect } from "react";
import MarketContract from "./contracts/Market.json";
import getWeb3 from "./getWeb3";
import Main from "./Main";
import web3 from "./utilities/web3";
import {loadContract} from "./utilities/contract";
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
  // const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState("");
  // const [contract, setContract] = useState("");

  useEffect(() => {

    (async () => {
      await web3;
      await loadContract();
    })();

    async function setUpWeb3() {
      try {
        const web3Provider = await getWeb3();
        const accounts = await web3Provider.eth.getAccounts();
        const networkId = await web3Provider.eth.net.getId();
        const deployedNetwork = MarketContract.networks[networkId];
        const instance = new web3Provider.eth.Contract(MarketContract.abi, deployedNetwork && deployedNetwork.address);

        // setWeb3(web3Provider);
        setAccounts(accounts);
        // setContract(instance);

        const rewardTokenAddr = await instance.methods.rewardToken().call({ from: accounts[0] });
        console.log("rewardToken : ");
        console.log(rewardTokenAddr);

        const owner = await instance.methods.owner().call({ from: accounts[0] });
        console.log("owner : ");
        console.log(owner);

        // await instance.methods.addToken(rewardTokenAddr, BigInt(1 * 10 ** 18), "DAI").send({ from: accounts[0] });
        console.log("here : ");
        await instance.methods.addToken("0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD", "10000000000000000000", "ETH").call({ from: accounts[0] });

        console.log("here2 : ");
        const token0 = await instance.methods.tokens(0).call({ from: accounts[0] });
        console.log("token0 : ");
        console.log(token0);

        // console.log("here3 : ");
        // const rewardTokenPrice = await instance.methods.priceOf(token0).call({ from: accounts[0] });
        // console.log("rewardTokenPrice : ");
        // console.log(rewardTokenPrice);
        // console.log("here4 : ");
      } catch (error) {
        alert(`Failed to load web3, accounts, or contract. Check console for details.`);
        console.error(error);
      }
    }
    setUpWeb3();
  }, []);

  return (
    <ThemeProvider theme={theme}>
    <Main />
  </ThemeProvider>
  );
}

export default App;
