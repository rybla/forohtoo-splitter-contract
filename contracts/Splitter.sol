// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/src/interfaces/IERC20.sol";
import "forge-std/src/access/Ownable.sol";

contract Splitter is Ownable {
    uint256 public payout_rate;
    IERC20 public usdc;

    constructor(uint256 _payout_rate, address _usdcAddress) Ownable(msg.sender) {
        require(_payout_rate <= 100, "Payout rate must be between 0 and 100");
        payout_rate = _payout_rate;
        usdc = IERC20(_usdcAddress);
    }

    function split(uint256 _amount, address _recipient) external {
        require(usdc.transferFrom(msg.sender, address(this), _amount), "USDC transfer failed");

        uint256 payout_amount = (_amount * payout_rate) / 100;

        if (payout_amount > 0) {
            require(usdc.transfer(_recipient, payout_amount), "Payout transfer failed");
        }
    }

    function withdraw() external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        require(usdc.transfer(owner(), balance), "Withdrawal failed");
    }
}
