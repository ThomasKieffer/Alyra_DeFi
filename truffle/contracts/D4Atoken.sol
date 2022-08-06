// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";


/// @title ERC20 D4A.
/// @notice ERC20 with permissions.
/// @dev Must be used with Market.sol as a reward token.
contract D4Atoken is ERC20, Ownable {
    mapping(address => bool) admins;

    constructor() ERC20("DeFi For All token", "D4A") {}

    /// @notice Mint X D4A tokens to a recipient
    /// @dev Owner must have added an admin before
    /// @param recipient The recipient that will receive X D4A.
    /// @param amount The amount of D4A to be minted.
    function mint(address recipient, uint256 amount) external {
        require(admins[msg.sender], "You are not admin");
        _mint(recipient, amount);
    }

    /// @notice Gives admin permissions
    /// @param _admin The address that will receive permissions
    function addAdmin(address _admin) external onlyOwner {
        admins[_admin] = true;
    }

    /// @notice Removes admin permissions
    /// @param _admin The address that will loose permissions
    function removeAdmin(address _admin) external onlyOwner {
        admins[_admin] = false;
    }

    /// @notice Get wether or not someone is admin.
    /// @dev Used for Unit tests
    /// @param _admin The address to check.
    /// @return true if admin, false if not.
    function getAdmin(address _admin) external view returns (bool) {
        return admins[_admin];
    }
}
