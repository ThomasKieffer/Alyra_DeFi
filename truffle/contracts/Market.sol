// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;
//we use ERC20 instead of IERC20 because we might need to access name or symbol
//if we end up not using those, it should be change back to IERC20
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Market  is Ownable {
    //same global logic as aave we put tokens addresses in a map to ERC20
    mapping(address => ERC20) private _reserves;
    //we make a map for each users addresses we have a map of token addresses to the user balance in that token
    mapping(address => mapping(address => uint)) private _balances;

    //Owner can add ERC20 token with their addresses
    function addToken(address asset) external onlyOwner {
        _reserves[asset] = ERC20(asset);
    }

    //BE CAREFULL of reentrency !
    function deposit(uint amount, address asset) external {
        _balances[msg.sender][asset] += amount;
        _reserves[asset].transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(address to, uint amount, address asset) external {
        // require(_reserves[asset].balanceOf(address(this)) >= amount, "Withdrawing too much"); pretty sure it's useless because the transfert will simply not append
        require(_balances[msg.sender][asset] >= amount, "Withdrawing too much");
        _reserves[asset].transfer(to, amount);
    }
}
