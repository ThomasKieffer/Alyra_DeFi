import React, { useState, useEffect } from "react";
import MarketContract from '../contracts/Market.json';
import ierc20Contract from '../contracts/IERC20.json';
import D4AtokenContract from '../contracts/D4Atoken.json';
import contractStore from '../storage/contract';
import web3js from 'web3';
import getWeb3 from "../getWeb3";

let instance;

/**
 * Load the contract with our web3 provider
 *
 * @return {Promise<void>}
 */
async function loadContract() {
    const web3Provider = await getWeb3();
    const networkId = await web3Provider.eth.net.getId();
    const deployedNetwork = MarketContract.networks[networkId];

    if (!deployedNetwork || !deployedNetwork.address) {
        contractStore.setState({noContractSet: true});
        return;
    }

    instance = new web3Provider.eth.Contract(
        MarketContract.abi,
        deployedNetwork && deployedNetwork.address,
    );
}

async function getBalance(tokenAddress) {
    const result = await instance.methods.accounts(tokenAddress).call();
    return result.balance;
}

async function addToken(tokenAddress, rewardsPerHour, symbol) {
    const web3Provider = await getWeb3();
    const accounts = await web3Provider.eth.getAccounts();
    return instance.methods.addToken(tokenAddress, rewardsPerHour, symbol).send({ from: accounts[0] });
}

async function deposit(amount, tokenAddress) {
    const web3Provider = await getWeb3();
    const accounts = await web3Provider.eth.getAccounts();
    const contractIERC20Instance = new web3Provider.eth.Contract(
        ierc20Contract.abi,
        tokenAddress,
    );

    const weiAmount = web3js.utils.toWei(amount);

    await contractIERC20Instance.methods.approve(instance._address, weiAmount).send({ from: accounts[0] });
    await instance.methods.deposit(weiAmount, tokenAddress).send({ from: accounts[0] });
}

async function claim() {
    const web3Provider = await getWeb3();
    const accounts = await web3Provider.eth.getAccounts();
    return instance.methods.claim().send({ from: accounts[0] });
}

async function isOwner(walletAddress) {
    if (!walletAddress) {
        return false;
    }
    await loadContract();
    const owner = await instance.methods.owner().call();
    return web3js.utils.toChecksumAddress(owner) === web3js.utils.toChecksumAddress(walletAddress);
}

async function withdraw(amount, tokenAddress) {
    const web3Provider = await getWeb3();
    const accounts = await web3Provider.eth.getAccounts();
    const weiAmount = web3js.utils.toWei(amount);

    await instance.methods.withdraw(weiAmount, tokenAddress).send({ from: accounts[0] });
}

/**
 * D4A Token contract instance
 */
let D4AtokenContractInstance;

/**
 * Retrieve Token information from token SC
 * @return {Promise<null|{symbol: *, address, decimals: *, name: *}>}
 */
 async function getRewardTokenInfo() {
    const web3Provider = await getWeb3();
    const networkId = await web3Provider.eth.net.getId();
    const deployedNetwork = D4AtokenContract.networks[networkId];

    if (!deployedNetwork || !deployedNetwork.address) {
        return null;
    }

    D4AtokenContractInstance = new web3Provider.eth.Contract(
        D4AtokenContract.abi,
        deployedNetwork && deployedNetwork.address,
    );

    return {
        symbol: await D4AtokenContractInstance.methods.symbol().call(),
        decimals: await D4AtokenContractInstance.methods.decimals().call(),
        name: await D4AtokenContractInstance.methods.name().call(),
        address: deployedNetwork.address
    }

}

export {
    loadContract,
    addToken,
    isOwner,
    claim,
    deposit,
    withdraw,
    getBalance,
    };
