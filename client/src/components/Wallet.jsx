import React, {useEffect, useState} from 'react';
import { ethers } from 'ethers';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Button from "@mui/material/Button";
import "./Style.css";

function Wallet() {

	const [accountAddress, setAccountAddress] = useState('');
	const [accountBalance, setAccountBalance] = useState('');

	const [isConnected, setIsConnected] = useState(false);

	const { ethereum } = window;

	const provider = new ethers.providers.Web3Provider(window.ethereum);

	useEffect(() => {
	}, []);

	const connectWallet = async () => {
		try {
			const accounts = await ethereum.request({
				method: 'eth_requestAccounts',
			});

			let balance = await provider.getBalance(accounts[0]);
			let bal = ethers.utils.formatEther(balance);

			setAccountAddress(accounts[0]);
			setAccountBalance(bal);
			setIsConnected(true);
		} catch (error) {
			setIsConnected(false);
		}
	};

    let textButton = 'Connect';
    if (accountAddress) {
        textButton = accountAddress.substring(0, 5) + '...' + accountAddress.substring(accountAddress.length - 3);
    }
    
	return (
			<div className="Wallet"><Button color="inverse" variant="Outlined" endIcon={<AccountBalanceWalletIcon />} onClick={connectWallet}>{textButton}</Button></div>
	)
}

export default Wallet;