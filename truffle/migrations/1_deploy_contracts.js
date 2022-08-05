//test on Ganache
const D4A = artifacts.require("D4Atoken");
const ChainlinkKovanUSD = artifacts.require("ChainlinkKovanUSD");
const Market = artifacts.require("Market");

module.exports = async function (deployer, _network, accounts) {
  await deployer.deploy(D4A);
  const d4a = await D4A.deployed();
  await deployer.deploy(ChainlinkKovanUSD);
  await deployer.deploy(Market, d4a.address);
};
