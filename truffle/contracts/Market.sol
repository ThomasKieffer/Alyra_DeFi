// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./D4Atoken.sol";
import "./ChainlinkKovanUSD.sol";

/// @title Stacking project
/// @notice Staking with deposit, withdrawal and rewards
contract Market is Ownable {

    // We need to keep the timestamp of the last transaction(deposit, withdraw or claim) to calculate the reward balance at each of those actions
    struct  Reserve {
        ERC20 token;
        string priceSymbol;
        uint rewardPerHourFor1TKN; //we want Xwei tokens per hour for 1ether stacked token
        bool isSupported;
    }

    struct  Balance {
        uint amount;
        uint lastTransactTimeStamp;
    }

    //we make a map for each users addresses we have a map of token addresses to the user balance in that token
    mapping(address => Reserve) private reserves;

    mapping(address => mapping(address => Balance)) private balances;
    
    //the amount of rewards for each users
    mapping(address => uint) private rewardBalances;

    //we have to keep the addresses of accepted tokens to iterate over the map when we claim
    //because onlyOwner can add tokens we shouldn't have an array too big
    //public for units tests
    address[] public tokens;
    //public for units tests
    D4Atoken public rewardToken;
    ChainlinkKovanUSD pricesUSD;
    
    event TokenAdded(address asset);
    event Deposited(uint amount, address asset, address user);
    event Withdrawn(uint amount, address asset, address user);
    event RewardUpdated(uint amount, address user);
    event Claimed(uint amount, address user);

    /// @notice Check if the asset given to the function as been added
    /// @param _asset The address of the asset to check.
    modifier onlySupportedToken(address _asset) {
        require(reserves[_asset].isSupported, "Token not supported");
        _;
    }

    /// @notice Set the reward token and chainlink to get prices.
    /// @param _rewardToken The reward token.
    constructor(D4Atoken _rewardToken) {
        rewardToken = _rewardToken;
        pricesUSD = new ChainlinkKovanUSD();
    } 

    /// @notice Register a token to be supported by the market.
    /// @dev  The owner associate the price of the token by using the corresponding map of ChainlinkKovanUSD.
    /// @param _asset The address of the token to be added.
    /// @param _rewardPerHourFor1TKN The number of reward tokens in wei units to be minted for 1 ether units of the given asset during 1 hour.
    /// @param _priceSymbol The symbol of the token to be looked for in chainlink when we want the price of the asset. Can be different of the asset symbol. (ex: D4A => DAI, D4A will have the same price as DAI).
    function addToken(address _asset, uint _rewardPerHourFor1TKN, string memory _priceSymbol) external onlyOwner {
        require(reserves[_asset].isSupported == false ,"Token already supported");
        reserves[_asset] = Reserve({
            token: ERC20(_asset), 
            priceSymbol : _priceSymbol,
            rewardPerHourFor1TKN: _rewardPerHourFor1TKN,
            isSupported: true
        });
        tokens.push(_asset);
        emit TokenAdded(_asset);
    }

    /// @notice Get the price of the asset in USD.
    /// @dev Uses Chainlink datafeeds on kovan. The result must be divided by 8 to get the correct dollar decimal.
    /// @param _asset The address of the token for wich we want the price.
    /// @return The price in USD.
    function priceOf(address _asset) external view onlySupportedToken(_asset) returns (int) {
        return pricesUSD.getLatestPrice(reserves[_asset].priceSymbol);
    }

    /// @notice Allows a user to deposit Xwei tokens.
    /// @dev We update all of our informations once the transaction has succeded.
    /// @param _amount The amount of asset in wei to be deposited.
    /// @param _asset The address of the token to be stack.
    function deposit(uint _amount, address _asset) external onlySupportedToken(_asset) {
        reserves[_asset].token.transferFrom(msg.sender, address(this), _amount);
        balances[msg.sender][_asset].lastTransactTimeStamp = block.timestamp;
        updateRewardBalance(_asset);
        balances[msg.sender][_asset].amount += _amount;
        emit Deposited(_amount, _asset, msg.sender);
    }

    /// @notice Allows a user to withdraw Xwei tokens.
    /// @dev We update all of our informations once the transaction has succeded.
    /// @param _amount The amount of asset in wei to be withdrawn.
    /// @param _asset The address of the token to be withdrawn.
    function withdraw(uint _amount, address _asset) external onlySupportedToken(_asset) {
        require(getBalance(_asset) >= _amount, "Withdrawing too much");
        updateRewardBalance(_asset);
        balances[msg.sender][_asset].amount -= _amount;
        if(getBalance(_asset) > 0 ){
            balances[msg.sender][_asset].lastTransactTimeStamp = block.timestamp;
        } else {
            balances[msg.sender][_asset].lastTransactTimeStamp = 0;
        }
        reserves[_asset].token.transfer(msg.sender, _amount);
        emit Withdrawn(_amount,  _asset, msg.sender);
    }

    /// @notice Allows a user to retrieve his accumulated reward tokens
    /// @dev This function must be strongly secure as we mint the calculated amount at the end.
    function claim() external {
        address tokenAddr;
        uint reward;
        for(uint i = 0; i < tokens.length; ++i){
            tokenAddr = tokens[i];
            if(getLastTransact(tokenAddr) > 0 ) {
                updateRewardBalance(tokenAddr);
                balances[msg.sender][tokenAddr].lastTransactTimeStamp = block.timestamp;
            }
        }
        require(rewardBalances[msg.sender] > 0, "No rewards to be minted");
        reward = rewardBalances[msg.sender];
        rewardBalances[msg.sender] = 0;
        rewardToken.mint(msg.sender, reward);
        emit Claimed(reward, msg.sender);
    }

    /// @notice Calculate the global reward balance of a user with the rewards accumulated for ALL tokens.
    /// @dev This function allow to check the global rewards without modifying state variables. Developper can then call this function rapidely in the front-end.
    function calculateTotalRewardEarned() external view returns(uint) {
        address tokenAddr;
        uint totalRewards = rewardBalances[msg.sender];
        for(uint i = 0; i < tokens.length; ++i){
            tokenAddr = tokens[i];
            if( getLastTransact(tokenAddr) > 0 ) {
                totalRewards += calculateRewardEarned(tokenAddr);
            }
        }
        return totalRewards;
    }

    /// @notice Calculate the rewards earned for a specific token.
    /// @dev Keeping track of the last transaction (deposit, withdraw, claim), allow us to calculate rewards earned between last transaction and now.
    /// @param _asset The address of the token we want to calculate the rewards.
    function calculateRewardEarned(address _asset) private view onlySupportedToken(_asset) returns(uint) {
        uint currentBalance = getBalance(_asset);
        uint lastTransact = getLastTransact(_asset);
        uint rewardPerHourFor1TKN = reserves[_asset].rewardPerHourFor1TKN;
        if(lastTransact > 0 && currentBalance > 0) {
            //We have to calculate the number of rewards by hour for the current balance
            uint rewardCurrentBalance = (currentBalance * rewardPerHourFor1TKN)/(1 ether);
            //We can now calculate the rewards gained
            return ((block.timestamp - lastTransact) * rewardCurrentBalance) / 3600;
        } else {
            return 0;
        }
    }

    /// @notice Update the global reward balance of a user with the rewards accumulated for one token.
    /// @dev Keeping track of the last transaction (deposit, withdraw, claim), allow us to update the global reward balance each time we make a transaction (deposit, withdraw, claim).
    function updateRewardBalance(address _asset) private onlySupportedToken(_asset) {
        rewardBalances[msg.sender] += calculateRewardEarned(_asset);
        emit RewardUpdated(rewardBalances[msg.sender], msg.sender);
    }

    /// @notice Retrieve the amount of token stacked.
    /// @dev Public for unit tests.
    /// @param _asset The address of the token we want to calculate the amount stacked.
    function getBalance(address _asset) public view onlySupportedToken(_asset) returns(uint) {
        return balances[msg.sender][_asset].amount;
    }

    /// @notice Retrieve the time of the last traansaction.
    /// @dev Public for unit tests.
    /// @param _asset The address of the token we want the last transaction time.
    function getLastTransact(address _asset) public view onlySupportedToken(_asset) returns(uint) {
        return balances[msg.sender][_asset].lastTransactTimeStamp;
    }

    /// @notice Retrieve the reserve of a token.
    /// @dev Made for unit tests.
    /// @param _asset The address of the token we want the reserve.
    function getReserve(address _asset) public view onlySupportedToken(_asset) returns(Reserve memory) {
        return reserves[_asset];
    }

    /// @notice Retrieve the global reward balance.
    /// @dev Made for unit tests.
    /// @return The amount of reward tokens earned.
    function getRewardBalance() public view returns(uint) {
        return rewardBalances[msg.sender];
    }
}
