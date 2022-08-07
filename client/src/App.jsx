import React, { useState, useEffect } from "react";
import getWeb3 from "./getWeb3";
import Market from "./contracts/Market.json";

function App() {

const [tokenAddr, setTokenAddr] = useState("");
const [accounts, setAccounts] = useState("");
const [contract, setContract] = useState("");

  useEffect(() => {
    async function setUpWeb3() {
      try {
        console.log ('FIRST');
        const web3Provider = await getWeb3();
        const accounts = await web3Provider.eth.getAccounts();
        const networkId = await web3Provider.eth.net.getId();
        const deployedNetwork = Market.networks[networkId];
        const instance = new web3Provider.eth.Contract(Market.abi, deployedNetwork && deployedNetwork.address);

        // setWeb3(web3Provider);
        setAccounts(accounts);
        setContract(instance);
    
        // let token0 = await instance.methods.tokens(0).call({ from: accounts[0] });
        // console.log (token0);
        
      } catch (error) {
        alert(`Failed to load web3, accounts, or contract. Check console for details.`);
        console.error(error);
      }
    }
    setUpWeb3();
  }, []);

  return (
    <div id="App">
      <div className="container">
      <h1>{tokenAddr} TEST</h1>
      </div>
    </div>
  );
}

export default App;