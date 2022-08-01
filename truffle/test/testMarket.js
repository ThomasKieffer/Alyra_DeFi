/* global BigInt */
const D4Atoken = artifacts.require("./D4Atoken.sol");
const Market = artifacts.require("./Market.sol");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

contract("Market", (accounts) => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const owner = accounts[0];
  const account1 = accounts[1];

  let D4AInstance;
  let MarketInstance;

  describe("First test, global workflow", function () {
    beforeEach(async function () {
      D4AInstance = await D4Atoken.deployed({ from: owner });
      MarketInstance = await Market.deployed(D4AInstance.address, { from: owner });
      // await D4AInstance.totalSupply({ from: owner });

      //add admins
      await D4AInstance.addAdmin(owner, { from: owner });
      await D4AInstance.addAdmin(MarketInstance.address, { from: owner });

      //add D4Atoken from owner
      await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), { from: owner });

      //mint vers account1
      await D4AInstance.mint(account1, BigInt(10 * 10 ** 18), { from: owner });
      let totalSupply = await D4AInstance.totalSupply({ from: owner });
      console.log("total supply : " + new BN(totalSupply));

      let balanceOfAccount1 = await D4AInstance.balanceOf(account1, { from: owner });
      console.log("balance of account1 : " + new BN(balanceOfAccount1));

      //approve market from account1
      await D4AInstance.approve(MarketInstance.address, BigInt(5 * 10 ** 18), { from: account1 });

      //deposit from account1
      await MarketInstance.deposit(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1 });
      await sleep(2000);

      //withdraw from account1
      await MarketInstance.withdraw(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1, gas: 100000 });
      await sleep(2000);

      //claim from account1
      await MarketInstance.claim({ from: account1 });
    });

    it("Test write tkn address", async () => {
      console.log("Token address : " + D4AInstance.address);
      console.log("Market address : " + MarketInstance.address);
    });
  });

  // it('should read newly written values', async() => {
  //   const simpleStorageInstance = await SimpleStorage.deployed();
  //   var value = (await simpleStorageInstance.read.call()).toNumber();

  //   assert.equal(value, 0, "0 wasn't the initial value");

  //   await simpleStorageInstance.write(1);
  //   value = (await simpleStorageInstance.read.call()).toNumber();
  //   assert.equal(value, 1, "1 was not written");

  //   await simpleStorageInstance.write(2);
  //   value = (await simpleStorageInstance.read.call()).toNumber();
  //   assert.equal(value, 2, "2 was not written");
  // });
});
