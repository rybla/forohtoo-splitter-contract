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

        // Mint some mock USDC to the user and approve the splitter
        await usdc.write.mint([user.account.address, 1000n]);
        await usdc.write.approve([splitter.address, 1000n], { account: user.account });

        // User sends 1000 USDC to the splitter
        await splitter.write.split([recipient.account.address, 1000n], { account: user.account });

        const ownerInitialBalance = await usdc.read.balanceOf([owner.account.address]);
        const contractBalance = await usdc.read.balanceOf([splitter.address]);

        // Owner withdraws the funds
        await splitter.write.withdraw([], { account: owner.account });

        const ownerFinalBalance = await usdc.read.balanceOf([owner.account.address]);
        const contractFinalBalance = await usdc.read.balanceOf([splitter.address]);

        assert.equal(contractFinalBalance, 0n);
        assert.equal(ownerFinalBalance, ownerInitialBalance + contractBalance);
    });

    it("should allow the owner to withdraw funds", async function () {
        const [owner, user, recipient] = await viem.getWalletClients();
        const usdc = await viem.deployContract("MockUSDC", [], {});
        const splitter = await viem.deployContract("Splitter", [50n, usdc.address]);

        // Mint some mock USDC to the user and approve the splitter
        await usdc.write.mint([user.account.address, 1000n]);
        await usdc.write.approve([splitter.address, 1000n], { account: user.account });

        // User sends 1000 USDC to the splitter
        await splitter.write.split([recipient.account.address, 1000n], { account: user.account });

        const recipientBalance = await usdc.read.balanceOf([recipient.account.address]);
        const contractBalance = await usdc.read.balanceOf([splitter.address]);
        const userBalance = await usdc.read.balanceOf([user.account.address]);

        assert.equal(recipientBalance, 500n);
        assert.equal(contractBalance, 500n);
        assert.equal(userBalance, 0n);
    });

    it("should revert if the allowance is insufficient", async function () {
        const [owner, user, recipient] = await viem.getWalletClients();
        const usdc = await viem.deployContract("MockUSDC", [], {});
        const splitter = await viem.deployContract("Splitter", [50n, usdc.address]);

        // Mint some mock USDC to the user
        await usdc.write.mint([user.account.address, 1000n]);

        // User approves the splitter contract to spend only 500 USDC
        await usdc.write.approve([splitter.address, 500n], { account: user.account });

        // User tries to send 1000 USDC to the splitter, which should fail
        await assert.rejects(
            splitter.write.split([recipient.account.address, 1000n], { account: user.account }),
            (err) => {
                assert.match(err.message, /Insufficient allowance/);
                return true;
            }
        );
    });
});
