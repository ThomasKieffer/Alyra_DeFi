import MarketContract from '../contracts/Market.json';
import ierc20Contract from '../contracts/IERC20.json';
import D4AtokenContract from '../contracts/D4Atoken.json';
import contractStore from '../storage/contract';
import web3 from "./web3";
import web3js from 'web3';

let contractInstance;

/**
 * Load the contract with our web3 provider
 *
 * @return {Promise<void>}
 */
async function loadContract() {
    const web3Provider = await web3;
    const networkId = await web3Provider.eth.net.getId();
    const deployedNetwork = MarketContract.networks[networkId];

    if (!deployedNetwork || !deployedNetwork.address) {
        contractStore.setState({noContractSet: true});
        return;
    }

    contractInstance = new web3Provider.eth.Contract(
        MarketContract.abi,
        deployedNetwork && deployedNetwork.address,
    );

}

async function getWalletBalance(walletAddress, tokenAddress) {
    const web3Provider = await web3;
    const contractIERC20Instance = new web3Provider.eth.Contract(
        ierc20Contract.abi,
        tokenAddress,
    );

    return contractIERC20Instance.methods.balanceOf(walletAddress).call();
}

async function getDepositedBalance(walletAddress, tokenAddress) {
    const result = await contractInstance.methods.accounts(walletAddress, tokenAddress).call();
    return result.balance;
}

async function getTVL(tokenAddress) {
    const pool = await contractInstance.methods.pools(tokenAddress).call();
    return pool.balance;
}

async function claimableRewards(walletAddress, tokenAddress) {
    return await contractInstance.methods.claimable(tokenAddress, walletAddress).call();
}

async function deposit(walletAddress, tokenAddress, amount) {
    const web3Provider = await web3;
    const contractIERC20Instance = new web3Provider.eth.Contract(
        ierc20Contract.abi,
        tokenAddress,
    );

    const weiAmount = web3js.utils.toWei(amount);

    await contractIERC20Instance.methods.approve(contractInstance._address, weiAmount).send({from: walletAddress});
    await contractInstance.methods.deposit(tokenAddress, weiAmount).send({from: walletAddress});
}

async function withdraw(walletAddress, tokenAddress, amount) {
    const weiAmount = web3js.utils.toWei(amount);

    await contractInstance.methods.withdraw(tokenAddress, weiAmount).send({from: walletAddress});
}

async function claim(walletAddress, tokenAddress) {
    return contractInstance.methods.claim(tokenAddress).send({from: walletAddress});
}

async function createPool(walletAddress, tokenAddress, oracleAddress, rewardsPerSecond, symbol, decimalsOracle) {
    return contractInstance.methods.createPool(tokenAddress, oracleAddress, decimalsOracle, rewardsPerSecond, symbol).send({from: walletAddress});
}

async function isOwner(walletAddress) {
    if (!walletAddress) {
        return false;
    }
    await loadContract();
    const owner = await contractInstance.methods.owner().call();
    return web3js.utils.toChecksumAddress(owner) === web3js.utils.toChecksumAddress(walletAddress);
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
    const web3Provider = await web3;
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
    getWalletBalance,
    getDepositedBalance,
    claimableRewards,
    deposit,
    withdraw,
    getTVL,
    getRewardTokenInfo,
    isOwner,
    claim,
    };
