import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseUnits } from "viem";

describe("Splitter", function () {
  async function deployContracts() {
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const mockUSDC = await hre.viem.deployContract("MockUSDC", []);
    const splitter = await hre.viem.deployContract("Splitter", [
      50,
      mockUSDC.address,
    ]);

    // Mint some mock USDC to the owner
    await mockUSDC.write.mint([owner.account.address, parseUnits("1000", 6)]);

    return {
      splitter,
      mockUSDC,
      owner,
      otherAccount,
    };
  }

  it("Should deploy with the correct payout rate", async function () {
    const { splitter } = await loadFixture(deployContracts);
    expect(await splitter.read.payout_rate()).to.equal(50n);
  });

  it("Should split the funds correctly", async function () {
    const { splitter, mockUSDC, owner, otherAccount } = await loadFixture(
      deployContracts
    );

    const amount = parseUnits("100", 6);
    await mockUSDC.write.approve([splitter.address, amount]);
    await splitter.write.split([amount, otherAccount.account.address]);

    const recipientBalance = await mockUSDC.read.balanceOf([
      otherAccount.account.address,
    ]);
    const contractBalance = await mockUSDC.read.balanceOf([splitter.address]);

    expect(recipientBalance).to.equal(parseUnits("50", 6));
    expect(contractBalance).to.equal(parseUnits("50", 6));
  });

  it("Should allow the owner to withdraw funds", async function () {
    const { splitter, mockUSDC, owner, otherAccount } = await loadFixture(
      deployContracts
    );

    const amount = parseUnits("100", 6);
    await mockUSDC.write.approve([splitter.address, amount]);
    await splitter.write.split([amount, otherAccount.account.address]);
    await splitter.write.withdraw();

    const ownerBalance = await mockUSDC.read.balanceOf([owner.account.address]);
    const contractBalance = await mockUSDC.read.balanceOf([splitter.address]);

    // The owner started with 1000, sent 100, and got 50 back.
    expect(ownerBalance).to.equal(parseUnits("950", 6));
    expect(contractBalance).to.equal(0n);
  });

  it("Should handle a payout rate of 0", async function () {
    const { mockUSDC, owner, otherAccount } = await loadFixture(
      deployContracts
    );
    const splitter = await hre.viem.deployContract("Splitter", [
      0,
      mockUSDC.address,
    ]);

    const amount = parseUnits("100", 6);
    await mockUSDC.write.approve([splitter.address, amount]);
    await splitter.write.split([amount, otherAccount.account.address]);

    const recipientBalance = await mockUSDC.read.balanceOf([
      otherAccount.account.address,
    ]);
    const contractBalance = await mockUSDC.read.balanceOf([splitter.address]);

    expect(recipientBalance).to.equal(0n);
    expect(contractBalance).to.equal(amount);
  });

  it("Should handle a payout rate of 100", async function () {
    const { mockUSDC, owner, otherAccount } = await loadFixture(
      deployContracts
    );
    const splitter = await hre.viem.deployContract("Splitter", [
      100,
      mockUSDC.address,
    ]);

    const amount = parseUnits("100", 6);
    await mockUSDC.write.approve([splitter.address, amount]);
    await splitter.write.split([amount, otherAccount.account.address]);

    const recipientBalance = await mockUSDC.read.balanceOf([
      otherAccount.account.address,
    ]);
    const contractBalance = await mockUSDC.read.balanceOf([splitter.address]);

    expect(recipientBalance).to.equal(amount);
    expect(contractBalance).to.equal(0n);
  });
});
