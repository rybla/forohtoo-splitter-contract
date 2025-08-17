import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("Splitter", function () {
    const { viem } = network;

    async function deployContracts() {
        const [owner, user, recipient] = await viem.getWalletClients();
        const publicClient = await viem.getPublicClient();

        const usdc = await viem.deployContract("MockUSDC", [], {});
        const splitter = await viem.deployContract("Splitter", [50, usdc.address], { walletClient: owner });

        // Mint some mock USDC to the user
        await usdc.write.mint([user.account.address, 1000n]);

        return { owner, user, recipient, usdc, splitter, publicClient };
    }

    it("should deploy with the correct payout rate", async function () {
        const { splitter } = await deployContracts();
        const payoutRate = await splitter.read.payout_rate();
        assert.equal(payoutRate, 50n);
    });

    it("should split the funds correctly", async function () {
        const { user, recipient, usdc, splitter } = await deployContracts();

        const amount = 100n;
        await usdc.write.approve([splitter.address, amount], { walletClient: user });
        await splitter.write.split([recipient.account.address, amount], { walletClient: user });

        const recipientBalance = await usdc.read.balanceOf([recipient.account.address]);
        assert.equal(recipientBalance, 50n);

        const contractBalance = await usdc.read.balanceOf([splitter.address]);
        assert.equal(contractBalance, 50n);
    });

    it("should allow the owner to withdraw funds", async function () {
        const { owner, user, recipient, usdc, splitter } = await deployContracts();

        const amount = 100n;
        await usdc.write.approve([splitter.address, amount], { walletClient: user });
        await splitter.write.split([recipient.account.address, amount], { walletClient: user });

        const initialOwnerBalance = await usdc.read.balanceOf([owner.account.address]);
        await splitter.write.withdraw([], { walletClient: owner });

        const finalOwnerBalance = await usdc.read.balanceOf([owner.account.address]);
        const contractBalance = await usdc.read.balanceOf([splitter.address]);

        assert.equal(contractBalance, 0n);
        assert.equal(finalOwnerBalance, initialOwnerBalance + 50n);
    });
});
