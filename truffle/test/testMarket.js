/* global BigInt */
const D4Atoken = artifacts.require("./D4Atoken.sol");
const Market = artifacts.require("./Market.sol");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

contract("Market", (accounts) => {
  const owner = accounts[0];
  const account1 = accounts[1];

  let D4AInstance;
  let MarketInstance;
  const aaveDAI = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD";

  describe("test addToken and getToken", function () {
    beforeEach(async function () {
      D4AInstance = await D4Atoken.new({ from: owner });
      MarketInstance = await Market.new(D4AInstance.address, { from: owner });
    });

    context("test on failure", function () {
      it("should not add token if not the owner, revert", async () => {
        expectRevert(MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), "DAI", { from: account1 }), "Ownable: caller is not the owner");
      });

      it("should not add token if token already supported, revert", async () => {
        await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), "DAI", { from: owner });
        expectRevert(MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), "DAI", { from: owner }), "Token already supported");
      });
    });

    context("test on success", function () {
      it("should add token, get token", async () => {
        await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), "DAI", { from: owner });
        const storedData = await MarketInstance.getReserve(D4AInstance.address, { from: owner });
        expect(storedData.token).equal(D4AInstance.address);
      });

      it("should add token, get rewardPerHourFor1TKN", async () => {
        await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), "DAI", { from: owner });
        const storedData = await MarketInstance.getReserve(D4AInstance.address, { from: owner });
        expect(BigInt(storedData.rewardPerHourFor1TKN)).equal(BigInt(1 * 10 ** 18));
      });

      it("should add token, get isSupported", async () => {
        await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), "DAI", { from: owner });
        const storedData = await MarketInstance.getReserve(D4AInstance.address, { from: owner });
        expect(storedData.isSupported).to.be.true;
      });

      it("should add token, get tokens[0]", async () => {
        await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), "DAI", { from: owner });
        const storedData = await MarketInstance.tokens(0, { from: owner });
        expect(storedData).equal(D4AInstance.address);
      });

      it("should add token, get event TokenAdded", async () => {
        const findEvent = await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), "DAI", { from: owner });
        expectEvent(findEvent, "TokenAdded", { asset: D4AInstance.address });
      });
    });
  });

  describe("test deposit and getBalance", function () {
    beforeEach(async function () {
      D4AInstance = await D4Atoken.new({ from: owner });
      MarketInstance = await Market.new(D4AInstance.address, { from: owner });
      await D4AInstance.addAdmin(owner, { from: owner });
      await D4AInstance.mint(account1, BigInt(12 * 10 ** 18), { from: owner });
      await D4AInstance.approve(MarketInstance.address, BigInt(10 * 10 ** 18), { from: account1 });
      await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), "DAI", { from: owner });
    });

    context("test on failure", function () {
      it("should not deposit if token not supported, revert", async () => {
        expectRevert(MarketInstance.deposit(BigInt(1 * 10 ** 18), aaveDAI, { from: account1 }), "Token not supported");
      });

      it("should not deposit if not enough funds, revert", async () => {
        expectRevert(MarketInstance.deposit(BigInt(12 * 10 ** 18), D4AInstance.address, { from: account1 }), "ERC20: insufficient allowance");
      });
    });

    context("test on success", function () {
      it("should deposit, get balance amount", async () => {
        await MarketInstance.deposit(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1 });
        const storedData = await MarketInstance.getBalance(D4AInstance.address, { from: account1 });
        expect(BigInt(storedData)).to.be.equal(BigInt(1 * 10 ** 18));
      });

      it("should deposit, get user tkn amount", async () => {
        await MarketInstance.deposit(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1 });
        const storedData = await D4AInstance.balanceOf(account1, { from: account1 });
        expect(BigInt(storedData)).to.be.equal(BigInt(11 * 10 ** 18));
      });

      it("should deposit, get lastTransactTimeStamp", async () => {
        await MarketInstance.deposit(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1 });
        const storedData = await MarketInstance.getLastTransact(D4AInstance.address, { from: account1 });
        expect(parseInt(storedData)).to.be.above(0);
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
      await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), "DAI", { from: owner });
      await MarketInstance.deposit(BigInt(10 * 10 ** 18), D4AInstance.address, { from: account1 });
    });

    context("test on failure", function () {
      it("should not withdraw if token not supported, revert", async () => {
        expectRevert(MarketInstance.withdraw(BigInt(1 * 10 ** 18), aaveDAI, { from: account1 }), "Token not supported");
      });

      it("should not withdraw if withdrawing too much, revert", async () => {
        expectRevert(MarketInstance.withdraw(BigInt(12 * 10 ** 18), D4AInstance.address, { from: account1 }), "Withdrawing too much");
      });
    });

    context("test on success", function () {
      it("should withdraw, get balance", async () => {
        await MarketInstance.withdraw(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1, gas: 100000 });
        const storedData = await MarketInstance.getBalance(D4AInstance.address, { from: account1 });
        expect(BigInt(storedData)).to.be.equal(BigInt(9 * 10 ** 18));
      });

      it("should withdraw, get user tkn balance", async () => {
        await MarketInstance.withdraw(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1, gas: 100000 });
        const storedData = await D4AInstance.balanceOf(account1, { from: account1 });
        expect(BigInt(storedData)).to.be.equal(BigInt(3 * 10 ** 18));
      });

      it("should withdraw, get timestamp", async () => {
        await MarketInstance.withdraw(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1, gas: 100000 });
        const storedData = await MarketInstance.getLastTransact(D4AInstance.address, { from: account1 });
        expect(parseInt(storedData)).to.be.above(0);
      });

      it("should withdraw ALL, get timestamp", async () => {
        await MarketInstance.withdraw(BigInt(10 * 10 ** 18), D4AInstance.address, { from: account1, gas: 100000 });
        const storedData = await MarketInstance.getLastTransact(D4AInstance.address, { from: account1 });
        expect(parseInt(storedData)).to.be.equal(0);
      });

      it("should withdraw, get event Withdrawn", async () => {
        const findEvent = await MarketInstance.withdraw(BigInt(1 * 10 ** 18), D4AInstance.address, { from: account1, gas: 100000 });
        expectEvent(findEvent, "Withdrawn", { amount: BigInt(1 * 10 ** 18).toString(), asset: D4AInstance.address, user: account1 });
      });
    });
  });

  describe("test claim and getRewardBalance", function () {
    beforeEach(async function () {
      D4AInstance = await D4Atoken.new({ from: owner });
      MarketInstance = await Market.new(D4AInstance.address, { from: owner });
      await D4AInstance.addAdmin(owner, { from: owner });
      await D4AInstance.mint(account1, BigInt(12 * 10 ** 18), { from: owner });
      await D4AInstance.approve(MarketInstance.address, BigInt(10 * 10 ** 18), { from: account1 });
      await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), "DAI", { from: owner });
    });

    context("test on failure", function () {
      it("should not get rewards if no rewards, revert", async () => {
        expectRevert(MarketInstance.claim({ from: account1 }), "No rewards to be minted");
      });
    });

    context("test on success", function () {
      it("should claim, get rewardBalance", async () => {
        await MarketInstance.deposit(BigInt(10 * 10 ** 18), D4AInstance.address, { from: account1 });
        setTimeout(async function () {
          await MarketInstance.claim({ from: account1 });
        }, 2000);
        const storedData = await MarketInstance.rewardToken({ from: account1 });
        expect(parseInt(storedData)).to.be.above(0);
      });

      it("should claim, get token balance of account1", async () => {
        await MarketInstance.deposit(BigInt(10 * 10 ** 18), D4AInstance.address, { from: account1 });
        const balanceBeforeClaim = await D4AInstance.balanceOf(account1, { from: account1 });
        setTimeout(async function () {
          await MarketInstance.claim({ from: account1 });
        }, 2000);
        const balanceAfterClaim = await D4AInstance.balanceOf(account1, { from: account1 });
        setTimeout(async function () {
          expect(parseInt(balanceAfterClaim)).to.be.above(parseInt(balanceBeforeClaim));
        }, 4000);
      });

      it("should claim, get event Claimed", async () => {
        await MarketInstance.deposit(BigInt(10 * 10 ** 18), D4AInstance.address, { from: account1 });
        let findEvent;
        setTimeout(async function () {
          findEvent = await MarketInstance.claim({ from: account1 });
        }, 2000);
        setTimeout(async function () {
          expectEvent(findEvent, "Claimed", { amount: BigInt(1 * 10 ** 18), asset: D4AInstance.address, user: account1 });
        }, 4000);
      });
    });
  });

  describe.skip("test compute reward functions through deposit, withdraw and claim", function () {
    beforeEach(async function () {
      D4AInstance = await D4Atoken.new({ from: owner });
      MarketInstance = await Market.new(D4AInstance.address, { from: owner });
      await D4AInstance.addAdmin(owner, { from: owner });
      await D4AInstance.mint(account1, BigInt(15 * 10 ** 18), { from: owner });
      await D4AInstance.approve(MarketInstance.address, BigInt(10 * 10 ** 18), { from: account1 });
      await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), "DAI", { from: owner });
    });

    context("test on success", function () {
      it("deposit once, should calculateRewardEarned, get result", async () => {
        await MarketInstance.deposit(BigInt(5 * 10 ** 18), D4AInstance.address, { from: account1 });
        const res1 = await MarketInstance.getRewardBalance({ from: account1 });
        setTimeout(async function () {
          expect(new BN(res1)).to.be.bignumber.equal(new BN(0));
        }, 2000);
        const res2 = await MarketInstance.calculateTotalRewardEarned({ from: account1 });
        setTimeout(async function () {
          expect(new BN(res2)).to.be.bignumber.above(new BN(0));
        }, 4000);
      });

      it("deposit twice, should calculateRewardEarned, get result", async () => {
        await MarketInstance.deposit(BigInt(5 * 10 ** 18), D4AInstance.address, { from: account1 });
        const res1 = await MarketInstance.getRewardBalance({ from: account1 });
        expect(new BN(res1)).to.be.bignumber.equal(new BN(0));
        await MarketInstance.deposit(BigInt(5 * 10 ** 18), D4AInstance.address, { from: account1 });
        const res2 = await MarketInstance.getRewardBalance({ from: account1 });
        setTimeout(async function () {
          expect(new BN(res2)).to.be.bignumber.above(new BN(0));
        }, 2000);
        const res3 = await MarketInstance.calculateTotalRewardEarned({ from: account1 });
        setTimeout(async function () {
          expect(new BN(res3)).to.be.bignumber.above(new BN(res2));
        }, 4000);
      });

      it("deposit once, withdraw once, should calculateRewardEarned, get result", async () => {
        await MarketInstance.deposit(BigInt(5 * 10 ** 18), D4AInstance.address, { from: account1 });
        const res1 = await MarketInstance.getRewardBalance({ from: account1 });
        expect(new BN(res1)).to.be.bignumber.equal(new BN(0));
        await MarketInstance.withdraw(BigInt(5 * 10 ** 18), D4AInstance.address, { from: account1, gas: 100000 });
        const res2 = await MarketInstance.getRewardBalance({ from: account1 });
        setTimeout(async function () {
          expect(new BN(res2)).to.be.bignumber.above(new BN(0));
        }, 2000);
        const res3 = await MarketInstance.calculateTotalRewardEarned({ from: account1 });
        setTimeout(async function () {
          expect(new BN(res3)).to.be.bignumber.above(new BN(res2));
        }, 4000);
      });

      it("deposit once, withdraw once, claim once, should calculateRewardEarned, get result", async () => {
        await MarketInstance.deposit(BigInt(5 * 10 ** 18), D4AInstance.address, { from: account1 });
        setTimeout(async function () {
          await MarketInstance.withdraw(BigInt(2 * 10 ** 18), D4AInstance.address, { from: account1, gas: 100000 });
        }, 1000);
        setTimeout(async function () {
          await MarketInstance.claim({ from: account1 });
        }, 2000);
        const res1 = await MarketInstance.getRewardBalance({ from: account1 });
        setTimeout(async function () {
          expect(new BN(res1)).to.be.bignumber.equal(new BN(0));
        }, 3000);
        const res2 = await MarketInstance.calculateTotalRewardEarned({ from: account1 });
        setTimeout(async function () {
          expect(new BN(res2)).to.be.bignumber.equal(new BN(0));
        }, 4000);
      });
    });
  });

  //Cannot test this way because of chainlink, need mocktest
  // describe.only("test priceOf", function () {
  //   beforeEach(async function () {
  //     D4AInstance = await D4Atoken.new({ from: owner });
  //     MarketInstance = await Market.new(D4AInstance.address, { from: owner });
  //     await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), { from: owner });
  //   });

  //   context("test on failure", function () {
  //     it("should not get price if token already supported, revert", async () => {
  //       expectRevert(await MarketInstance.priceOf(aaveDAI, { from: owner }), "Token not supported");
  //     });
  //   });

  //   context("test on success", function () {
  //     it("should get price of DAI in USD", async () => {
  //       const storedData = await MarketInstance.priceOf(D4AInstance.address, { from: owner });
  //       expect(new BN(storedData)).to.be.equal(new BN(1 * 10 ** 18));
  //     });
  //   });
  // });
});
