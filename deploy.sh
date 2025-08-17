# pnpx hardhat keystore set SEPOLIA_PRIVATE_KEY
# pnpx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
# pnpx hardhat ignition deploy --network sepolia ignition/modules/Splitter.ts
pnpx hardhat ignition deploy --network base-sepolia ignition/modules/Splitter.ts
pnpx hardhat verify --network base-sepolia --constructor-args-path ignition/constructorArgs/Splitter.ts 0xFe79475f4524de051BDE113AB4369d1390f0D634