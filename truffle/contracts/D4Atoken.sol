// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract D4Atoken is ERC20 {
    constructor() ERC20("DeFi For All token", "D4A") {}

    // fonction faucet pour créer des Dai tokens
    function faucet(address recipient, uint256 amount) external {
        _mint(recipient, amount);
    }
}
