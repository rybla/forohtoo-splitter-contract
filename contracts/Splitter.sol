// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract Splitter {
    uint public payout_rate;
    address public owner;
    IERC20 public usdc_token;

    constructor(uint _payout_rate, address _usdc_address) {
        require(_payout_rate <= 100, "payout_rate cannot be greater than 100");
        payout_rate = _payout_rate;
        owner = msg.sender;
        usdc_token = IERC20(_usdc_address);
    }

    function split(address _recipient, uint _amount) public {
        require(usdc_token.allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
        require(usdc_token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        uint payout_amount = (_amount * payout_rate) / 100;
        if (payout_amount > 0) {
            require(usdc_token.transfer(_recipient, payout_amount), "Payout transfer failed");
        }
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        uint balance = usdc_token.balanceOf(address(this));
        require(usdc_token.transfer(owner, balance), "Withdrawal failed");
    }
}
