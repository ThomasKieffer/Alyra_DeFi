// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ChainlinkKovanUSD.sol";

contract USDC is ERC20 {

    ChainlinkKovanUSD pricesUSD;

    constructor() public ERC20("USDC", "fUSDC") {
    pricesUSD = new ChainlinkKovanUSD();
    _mint(msg.sender, 100 ether);
    }
}