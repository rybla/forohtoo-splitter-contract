import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("Splitter", async function () {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();

    it("should deploy with the correct payout rate", async function () {
        const [owner, user, recipient] = await viem.getWalletClients();
        const usdc = await viem.deployContract("MockUSDC", [], {});
        const splitter = await viem.deployContract("Splitter", [50n, usdc.address]);

        // Mint some mock USDC to the user
        await usdc.write.mint([user.account.address, 1000n]);
        const payoutRate = await splitter.read.payout_rate();

        assert.equal(payoutRate, 50n);
    })

    it("should split the funds correctly", async function () {
        const [owner, user, recipient] = await viem.getWalletClients();
        const usdc = await viem.deployContract("MockUSDC", [], {});
        const splitter = await viem.deployContract("Splitter", [50n, usdc.address]);

        // Mint some mock USDC to the user
        await usdc.write.mint([user.account.address, 1000n]);
        const payoutRate = await splitter.read.payout_rate();

        // TODO: write rest of test
    });

    it("should allow the owner to withdraw funds", async function () {
        const [owner, user, recipient] = await viem.getWalletClients();
        const usdc = await viem.deployContract("MockUSDC", [], {});
        const splitter = await viem.deployContract("Splitter", [50n, usdc.address]);

        // Mint some mock USDC to the user
        await usdc.write.mint([user.account.address, 1000n]);
        const payoutRate = await splitter.read.payout_rate();

        // TODO: write rest of test
    });
});
