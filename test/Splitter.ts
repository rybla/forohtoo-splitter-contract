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
        const { usdc, splitter, user, recipient } = await deployContracts();

        const amount = 1000n;

        // Approve the splitter to spend the user's USDC
        await usdc.write.approve([splitter.address, amount], { account: user.account });

        // Split the funds
        await splitter.write.split([amount, recipient.account.address], { account: user.account });

        // Check the balances
        const userBalance = await usdc.read.balanceOf([user.account.address]);
        const recipientBalance = await usdc.read.balanceOf([recipient.account.address]);
        const splitterBalance = await usdc.read.balanceOf([splitter.address]);

        assert.equal(userBalance, 0n);
        assert.equal(recipientBalance, 500n);
        assert.equal(splitterBalance, 500n);
    });

    it("Should allow the owner to withdraw funds", async function () {
        const { usdc, splitter, owner, user, recipient } = await deployContracts();

        const amount = 1000n;

        // Approve and split to fund the contract
        await usdc.write.approve([splitter.address, amount], { account: user.account });
        await splitter.write.split([amount, recipient.account.address], { account: user.account });

        const ownerInitialBalance = await usdc.read.balanceOf([owner.account.address]);
        const splitterInitialBalance = await usdc.read.balanceOf([splitter.address]);

        // Withdraw funds
        await splitter.write.withdraw({ account: owner.account });

        // Check balances
        const ownerFinalBalance = await usdc.read.balanceOf([owner.account.address]);
        const splitterFinalBalance = await usdc.read.balanceOf([splitter.address]);

        assert.equal(splitterFinalBalance, 0n);
        assert.equal(ownerFinalBalance, ownerInitialBalance + splitterInitialBalance);
    });

    it("Should not allow a non-owner to withdraw funds", async function () {
        const { splitter, user } = await deployContracts();

        await assert.rejects(
            splitter.write.withdraw({ account: user.account }),
            (err: any) => {
                // TODO: check for a more specific error
                return true;
            }
        );
    });

    it("Should not deploy with a payout rate > 100", async function () {
        const { viem } = await network.connect();
        const [owner] = await viem.getWalletClients();
        const usdc = await viem.deployContract("MockUSDC", [], {});

        await assert.rejects(
            viem.deployContract("Splitter", [101n, usdc.address]),
            (err: any) => {
                // TODO: check for a more specific error
                return true;
            }
        )
    });

    it("Should handle a 0% payout rate correctly", async function () {
        const { viem } = await network.connect();
        const [owner, user, recipient] = await viem.getWalletClients();
        const usdc = await viem.deployContract("MockUSDC", [], {});
        const splitter = await viem.deployContract("Splitter", [0n, usdc.address]);
        await usdc.write.mint([user.account.address, 1000n]);

        const amount = 1000n;
        await usdc.write.approve([splitter.address, amount], { account: user.account });
        await splitter.write.split([amount, recipient.account.address], { account: user.account });

        const recipientBalance = await usdc.read.balanceOf([recipient.account.address]);
        const splitterBalance = await usdc.read.balanceOf([splitter.address]);
        assert.equal(recipientBalance, 0n);
        assert.equal(splitterBalance, 1000n);
    });

    it("Should handle a 100% payout rate correctly", async function () {
        const { viem } = await network.connect();
        const [owner, user, recipient] = await viem.getWalletClients();
        const usdc = await viem.deployContract("MockUSDC", [], {});
        const splitter = await viem.deployContract("Splitter", [100n, usdc.address]);
        await usdc.write.mint([user.account.address, 1000n]);

        const amount = 1000n;
        await usdc.write.approve([splitter.address, amount], { account: user.account });
        await splitter.write.split([amount, recipient.account.address], { account: user.account });

        const recipientBalance = await usdc.read.balanceOf([recipient.account.address]);
        const splitterBalance = await usdc.read.balanceOf([splitter.address]);
        assert.equal(recipientBalance, 1000n);
        assert.equal(splitterBalance, 0n);
    });
});
