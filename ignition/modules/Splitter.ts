import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// USDC contract address on Ethereum Sepolia
const usdc_address = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"

export default buildModule("SplitterModule", (m) => {
    const splitter = m.contract("Splitter", [50n, usdc_address]);
    return { splitter };
});
