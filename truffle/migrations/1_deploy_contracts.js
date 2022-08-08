const web3 = require('web3');

const D4Atoken = artifacts.require("D4Atoken");
const Market = artifacts.require("Market");
const USDC = artifacts.require("./USDC");

function tokens(n) {
  return web3.utils.toWei(n, "ether");
}

module.exports = async function(deployer, network, account) {

  await deployer.deploy(D4Atoken);
  const d4a = await D4Atoken.deployed();

  await deployer.deploy(Market, d4a.address);
  const market = await Market.deployed();

  if (network === 'development') {

  await market.addToken(d4a.address, BigInt(1 * 10 ** 18), "DAI");
  }

  else if (network === 'kovan') {
    await market.addToken("0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD", "10000000000000000000", "ETH")
  }

};
