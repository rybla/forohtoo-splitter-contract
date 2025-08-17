import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
    plugins: [hardhatToolboxViemPlugin],
    solidity: {
        profiles: {
            default: {
                version: "0.8.28",
            },
            production: {
                version: "0.8.28",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        },
    },
    networks: {
        hardhatMainnet: {
            type: "edr-simulated",
            chainType: "l1",
        },
        hardhatOp: {
            type: "edr-simulated",
            chainType: "op",
        },
        sepolia: {
            type: "http",
            chainType: "l1",
            url: configVariable("SEPOLIA_RPC_URL"),
            accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
        },
        // for testnet
        'base-sepolia': {
            type: "http",
            url: 'https://sepolia.base.org',
            accounts: [process.env.WALLET_KEY as string],
            gasPrice: 1000000000,
        },
    },
    verify: {
        etherscan: {
            apiKey: process.env.BASESCAN_API_KEY!,
            enabled: true
        }
    }
};

export default config;
