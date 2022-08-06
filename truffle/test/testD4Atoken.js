/* global BigInt */
const D4Atoken = artifacts.require("./D4Atoken.sol");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

contract("Market", (accounts) => {
  const owner = accounts[0];
  const account1 = accounts[1];
  const account2 = accounts[2];
  const account3 = accounts[3];

  let D4AInstance;
  describe("test addAdmin and getAdmin", function () {
    beforeEach(async function () {
      D4AInstance = await D4Atoken.new({ from: owner });
    });

    context("test on failure", function () {
      it("should not add admin if not the owner, revert", async () => {
        expectRevert(D4AInstance.addAdmin(account1, { from: account1 }), "Ownable: caller is not the owner");
      });
    });

    context("test on success", function () {
      it("should add Admin, get admin", async () => {
        await D4AInstance.addAdmin(account1, { from: owner });
        const storedData = await D4AInstance.getAdmin(account1, { from: owner });
        expect(storedData).to.be.true;
      });
    });
  });

  describe("test removeAdmin and getAdmin", function () {
    beforeEach(async function () {
      D4AInstance = await D4Atoken.new({ from: owner });
      await D4AInstance.addAdmin(account1, { from: owner });
    });

    context("test on failure", function () {
      it("should not remove admin if not the owner, revert", async () => {
        expectRevert(D4AInstance.removeAdmin(account1, { from: account1 }), "Ownable: caller is not the owner");
      });
    });

    context("test on success", function () {
      it("should remove Admin, get admin", async () => {
        await D4AInstance.removeAdmin(account1, { from: owner });
        const storedData = await D4AInstance.getAdmin(account1, { from: owner });
        expect(storedData).to.be.false;
      });
    });
  });

  describe("test mint and getBalance", function () {
    beforeEach(async function () {
      D4AInstance = await D4Atoken.new({ from: owner });
      await D4AInstance.addAdmin(account1, { from: owner });
    });

    context("test on failure", function () {
      it("should not mint if not the admin, revert", async () => {
        expectRevert(D4AInstance.mint(account2, BigInt(5 * 10 ** 18), { from: account2 }), "You are not admin");
      });
    });

    context("test on success", function () {
      it("should mint, get balance", async () => {
        await D4AInstance.mint(account2, BigInt(5 * 10 ** 18), { from: account1 });
        const storedData = await D4AInstance.balanceOf(account2, { from: account1 });
        expect(BigInt(storedData).toString()).to.be.equal(BigInt(5 * 10 ** 18).toString());
      });
    });
  });

  describe("test multiple calls", function () {
    beforeEach(async function () {
      D4AInstance = await D4Atoken.new({ from: owner });
      await D4AInstance.addAdmin(account1, { from: owner });
    });

    context("test on success", function () {
      it("2 admins, 2 mint, 1 remove, 1 mint", async () => {
        await D4AInstance.addAdmin(account1, { from: owner });
        await D4AInstance.addAdmin(account2, { from: owner });
        const admin1 = await D4AInstance.getAdmin(account1, { from: owner });
        expect(admin1).to.be.true;
        const admin2 = await D4AInstance.getAdmin(account1, { from: owner });
        expect(admin2).to.be.true;

        await D4AInstance.mint(account1, BigInt(8 * 10 ** 18), { from: account2 });
        await D4AInstance.mint(account2, BigInt(5 * 10 ** 18), { from: account1 });
        const balance1 = await D4AInstance.balanceOf(account1, { from: account1 });
        expect(BigInt(balance1).toString()).to.be.equal(BigInt(8 * 10 ** 18).toString());
        const balance2 = await D4AInstance.balanceOf(account2, { from: account1 });
        expect(BigInt(balance2).toString()).to.be.equal(BigInt(5 * 10 ** 18).toString());

        await D4AInstance.removeAdmin(account2, { from: owner });
        const admin3 = await D4AInstance.getAdmin(account2, { from: owner });
        expect(admin3).to.be.false;

        expectRevert(D4AInstance.mint(account2, BigInt(6 * 10 ** 18), { from: account2 }), "You are not admin");

        await D4AInstance.mint(account2, BigInt(2 * 10 ** 18), { from: account1 });
        const balance3 = await D4AInstance.balanceOf(account2, { from: account2 });
        expect(BigInt(balance3).toString()).to.be.equal(BigInt(7 * 10 ** 18).toString());
      });
    });
  });
});
