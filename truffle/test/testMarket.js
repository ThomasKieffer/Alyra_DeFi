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
  const aaveDAI = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";

  //TODO check reward token is D4A
  describe.skip("First test, global workflow", function () {
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

  describe.skip("test addToken and getToken", function () {
    beforeEach(async function () {
      D4AInstance = await D4Atoken.new({ from: owner });
      MarketInstance = await Market.new(D4AInstance.address, { from: owner });
    });

    context("test on failure", function () {
      it("should not add token if not the owner, revert", async () => {
        await expectRevert(MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), { from: account1 }), "Ownable: caller is not the owner");
      });

      it("should not add token if token already supported, revert", async () => {
        await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), { from: owner });
        await expectRevert(MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), { from: owner }), "Token already supported");
      });
    });

    context("test on success", function () {
      it("should add token, get token", async () => {
        await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), { from: owner });
        const storedData = await MarketInstance.getReserve(D4AInstance.address, { from: owner });
        await expect(storedData.token).equal(D4AInstance.address);
      });

      it("should add token, get rewardPerHourFor1TKN", async () => {
        await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), { from: owner });
        const storedData = await MarketInstance.getReserve(D4AInstance.address, { from: owner });
        await expect(BigInt(storedData.rewardPerHourFor1TKN)).equal(BigInt(1 * 10 ** 18));
      });

      it("should add token, get isSupported", async () => {
        await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), { from: owner });
        const storedData = await MarketInstance.getReserve(D4AInstance.address, { from: owner });
        await expect(storedData.isSupported).to.be.true;
      });

      it("should add token, get tokens[0]", async () => {
        await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), { from: owner });
        const storedData = await MarketInstance.tokens(0, { from: owner });
        await expect(storedData).equal(D4AInstance.address);
      });

      it("should add token, get event TokenAdded", async () => {
        const findEvent = await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), { from: owner });
        expectEvent(findEvent, "TokenAdded", { asset: D4AInstance.address });
      });
    });
  });

  describe.skip("test deposit and getBalance", function () {
    beforeEach(async function () {
      D4AInstance = await D4Atoken.new({ from: owner });
      MarketInstance = await Market.new(D4AInstance.address, { from: owner });
      await D4AInstance.addAdmin(owner, { from: owner });
      await D4AInstance.mint(account1, BigInt(12 * 10 ** 18), { from: owner });
      await D4AInstance.approve(MarketInstance.address, BigInt(10 * 10 ** 18), { from: account1 });
      await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), { from: owner });
    });

    context("test on failure", function () {
      it("should not deposit if token not supported, revert", async () => {
        await expectRevert(MarketInstance.deposit(BigInt(1 * 10 ** 18), aaveDAI, { from: account1 }), "Token not supported");
      });

      it("should not deposit if not enough funds, revert", async () => {
        await expectRevert(MarketInstance.deposit(BigInt(12 * 10 ** 18), D4AInstance.address, { from: account1 }), "ERC20: insufficient allowance");
      });
    });

    context("test on success", function () {
      it("should deposit, get balance amount", async () => {
        await MarketInstance.deposit(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1 });
        const storedData = await MarketInstance.getBalance(D4AInstance.address, { from: account1 });
        await expect(BigInt(storedData)).to.be.equal(BigInt(1 * 10 ** 18));
      });

      it("should deposit, get lastTransactTimeStamp", async () => {
        await MarketInstance.deposit(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1 });
        const storedData = await MarketInstance.getLastTransact(D4AInstance.address, { from: account1 });
        await expect(parseInt(storedData)).to.be.above(0);
      });

      it("should deposit, get event Deposited", async () => {
        const findEvent = await MarketInstance.deposit(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1 });
        expectEvent(findEvent, "Deposited", { amount: BigInt(1 * 10 ** 18).toString(), asset: D4AInstance.address, user: account1 });
      });
    });
  });

  describe("test withdraw and getBalance", function () {
    beforeEach(async function () {
      D4AInstance = await D4Atoken.new({ from: owner });
      MarketInstance = await Market.new(D4AInstance.address, { from: owner });
      await D4AInstance.addAdmin(owner, { from: owner });
      await D4AInstance.mint(account1, BigInt(12 * 10 ** 18), { from: owner });
      await D4AInstance.approve(MarketInstance.address, BigInt(10 * 10 ** 18), { from: account1 });
      await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), { from: owner });
      const findEvent = await MarketInstance.deposit(BigInt(10 * 10 ** 18), D4AInstance.address, { from: account1 });
    });

    context("test on failure", function () {
      it("should not withdraw if token not supported, revert", async () => {
        await expectRevert(MarketInstance.withdraw(BigInt(1 * 10 ** 18), aaveDAI, { from: account1 }), "Token not supported");
      });

      it("should not withdraw if withdrawing too much, revert", async () => {
        await expectRevert(MarketInstance.withdraw(BigInt(12 * 10 ** 18), D4AInstance.address, { from: account1 }), "Withdrawing too much");
      });
    });

    context("test on success", function () {
      it("should withdraw, get balance", async () => {
        await MarketInstance.withdraw(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1, gas: 100000 });
        const storedData = await MarketInstance.getBalance(D4AInstance.address, { from: account1 });
        await expect(BigInt(storedData)).to.be.equal(BigInt(9 * 10 ** 18));
      });

      it("should withdraw, get timestamp", async () => {
        await MarketInstance.withdraw(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1, gas: 100000 });
        const storedData = await MarketInstance.getLastTransact(D4AInstance.address, { from: account1 });
        await expect(parseInt(storedData)).to.be.above(0);
      });

      it("should withdraw ALL, get timestamp", async () => {
        await MarketInstance.withdraw(BigInt(10 * 10 ** 18), D4AInstance.address, { from: account1, gas: 100000 });
        const storedData = await MarketInstance.getLastTransact(D4AInstance.address, { from: account1 });
        await expect(parseInt(storedData)).to.be.equal(0);
      });

      it("should withdraw, get event Withdrawn", async () => {
        const findEvent = await MarketInstance.withdraw(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1, gas: 100000 });
        expectEvent(findEvent, "Withdrawn", { amount: BigInt(1 * 10 ** 18).toString(), asset: D4AInstance.address, user: account1 });
      });
    });
  });
});
