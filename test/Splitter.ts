import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("Splitter", async function () {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();

    async function deployContracts() {
        const [owner, user, recipient] = await viem.getWalletClients();
        const usdc = await viem.deployContract("MockUSDC", [], {});
        const splitter = await viem.deployContract("Splitter", [50n, usdc.address]);

        // Mint some mock USDC to the user
        await usdc.write.mint([user.account.address, 1000n]);

        return {
            // clients
            owner, user, recipient,
            // contracts
            usdc, splitter
        }
    }

    it("Should deploy with the correct payout rate", async function () {
        const { splitter } = await deployContracts();

        const payoutRate = await splitter.read.payout_rate();
        assert.equal(payoutRate, 50n);
    })

    it("Should split the funds correctly", async function () {
        const { splitter } = await deployContracts();
        throw new Error("TODO: implement test");
    });

    it("Should allow the owner to withdraw funds", async function () {
        const { splitter } = await deployContracts();
        throw new Error("TODO: implement test");
    });
});

