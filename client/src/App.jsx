import React, { useState, useEffect } from "react";
import MarketContract from "./contracts/Market.json";
import getWeb3 from "./getWeb3";

// import UserAddress from "./components/UserAddress.jsx";
// import Workflow from "./components/Workflow";
// import Voters from "./components/Voters";
// import Proposals from "./components/Proposals";
// import SetVote from "./components/SetVote";

import "./App.css";

function App() {
  // const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState("");
  // const [contract, setContract] = useState("");

  useEffect(() => {
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

        const token0 = await instance.methods.tokens(0).call({ from: accounts[0] });
        console.log(token0);
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
        <h1>DeFi account = {accounts}</h1>
      </div>
    </div>
  );
}

export default App;
