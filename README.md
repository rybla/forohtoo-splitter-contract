# forohtoo-splitter-contract

The basic idea of this contract is the following: Anyone can send USDC and an address to the contract; the contract keeps some of the USDC and sends the rest of it to the specified address.

In more details:

- The contract specifies a fixed `payout_rate: uint` which corresponds to a percent from `0` to `100`.
- The contract deployer can withdraw money from this contract at any time.
- Anyone can send a transaction to this contract with an amount of USDC and an address.
    - When this contract recieves an `amount` of USDC and an `address`, it computes `payout_amount = (payout_rate * amount) / 100`. Then the contract sends `payout_amount` to the `address`.

## Resources

- [Solidity docs](https://docs.soliditylang.org/en/v0.8.30/)
- [Hardhat docs](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3)

## Contributing

The script `build.sh` must run without any warnings or errors before changes may be comitted.

```sh
./build.sh
```
