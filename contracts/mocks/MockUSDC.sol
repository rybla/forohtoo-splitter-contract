// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/src/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {}

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}
