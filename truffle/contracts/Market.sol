// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;
//we use ERC20 instead of IERC20 because we might need to access name or symbol
//if we end up not using those, it should be change back to IERC20
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Market  is Ownable {
    //same global logic as aave we put tokens addresses in a map to ERC20
    mapping(address => ERC20) private reserves;
    //we make a map for each users addresses we have a map of token addresses to the user balance in that token
    mapping(address => mapping(address => uint)) private balances;
    
    event TokenAdded(address asset);
    event Deposited(uint amount, address asset, address user);
    event Withdrawn(uint amount, address asset, address user);

    //Owner can add ERC20 token with their addresses
    function addToken(address _asset) external onlyOwner {
        reserves[_asset] = ERC20(_asset);
        emit TokenAdded(_asset);
    }

    //BE CAREFULL of reentrency !
    function deposit(uint _amount, address _asset) external {
        balances[msg.sender][_asset] += _amount;
        reserves[_asset].transferFrom(msg.sender, address(this), _amount);

        emit Deposited(_amount, _asset, msg.sender);
    }

    function withdraw(uint _amount, address _asset) external {
        // require(reserves[asset].balanceOf(address(this)) >= amount, "Withdrawing too much"); pretty sure it's useless because the transfert will simply not append
        require(balances[msg.sender][_asset] >= _amount, "Withdrawing too much");
        reserves[_asset].transfer(msg.sender, _amount);
        emit Withdrawn(_amount,  _asset, msg.sender);
    }
}
