//test on Ganache
const D4A = artifacts.require("D4Atoken");
const Market = artifacts.require("Market");

module.exports = async function (deployer, _network, accounts) {
  await deployer.deploy(D4A);
  const d4a = await D4A.deployed();
  await deployer.deploy(Market);
  const market = await Market.deployed();

  //add d4f as token for market
  await market.addToken(d4a.address);

  //transfert from account1 to market
  await d4a.faucet(accounts[1], 1000);
  const balance0 = await d4a.balanceOf(accounts[1]);
  console.log("balance accounts[1] after faucet = " + balance0.toString());
  const balance00 = await d4a.balanceOf(market.address);
  console.log("balance market after faucet = " + balance00.toString());
  console.log("\n");

  //transfert from account1 to market
  await d4a.approve(market.address, 1000, { from: accounts[1] });
  await market.deposit(1000, d4a.address, { from: accounts[1] });
  const balance1 = await d4a.balanceOf(accounts[1]);
  console.log("balance accounts[1] after tranfert from account1 = " + balance1.toString());
  const balance11 = await d4a.balanceOf(market.address);
  console.log("balance market after tranfert from account1 = " + balance11.toString());
  console.log("\n");

  //transfert from market to account1
  await market.withdraw(1000, d4a.address, { from: accounts[1] });
  const balance3 = await d4a.balanceOf(accounts[1]);
  console.log("balance accounts[1] after tranfert from market = " + balance3.toString());
  const balance33 = await d4a.balanceOf(market.address);
  console.log("balance market after tranfert from market = " + balance33.toString());
  console.log("\n");
};
