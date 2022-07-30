// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";


//add Ownable and access permissions
contract D4Atoken is ERC20, Ownable {
    mapping(address => bool) admins;

    constructor() ERC20("DeFi For All token", "D4A") {}

    function mint(address recipient, uint256 amount) external {
        require(admins[msg.sender], "You are not admin");
        _mint(recipient, amount);
    }

    function addAdmin(address _admin) external onlyOwner {
        admins[_admin] = true;
    }

    function removeAdmin(address _admin) external onlyOwner {
        admins[_admin] = false;
    }
}
