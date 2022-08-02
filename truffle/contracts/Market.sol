// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;
//we use ERC20 instead of IERC20 because we might need to access name or symbol
//if we end up not using those, it should be change back to IERC20
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./D4Atoken.sol";

contract Market  is Ownable {

    // We need to keep the timestamp of the last transaction(deposit, withdraw or claim) to calculate the reward balance at each of those actions
    struct  Reserve {
        ERC20 token;
        uint rewardPerHourFor1TKN; //we want X tokens per hour for 1 stacked token
        bool isSupported;
    }

    struct  Balance {
        uint amount;
        uint lastTransactTimeStamp;
    }
    
    mapping(address => Reserve) private reserves;
    //we make a map for each users addresses we have a map of token addresses to the user balance in that token
    mapping(address => mapping(address => Balance)) private balances;
    //the amount of rewards for each users
    mapping(address => uint) private rewardBalances;
    //we have to keep the address of token accepted to iterate over the map when we claim
    //because onlyOwner can add tokens we shouldn't have an array too big
    address[] public tokens;
    D4Atoken public rewardToken;
    
    event TokenAdded(address asset);
    event Deposited(uint amount, address asset, address user);
    event Withdrawn(uint amount, address asset, address user);
    event RewardUpdated(uint amount, address user);
    event Claimed(uint amount, address user);

    modifier onlySupportedToken(address _asset) {
        require(reserves[_asset].isSupported, "Token not supported");
        _;
    }

    constructor(D4Atoken _rewardToken) {
        rewardToken = _rewardToken;
    } 

    //Owner can add ERC20 token with their addresses
    function addToken(address _asset, uint _rewardPerHourFor1TKN) external onlyOwner {
        require(reserves[_asset].isSupported == false ,"Token already supported");
        reserves[_asset] = Reserve({
            token: ERC20(_asset), 
            rewardPerHourFor1TKN: _rewardPerHourFor1TKN,
            isSupported: true
        });
        tokens.push(_asset);
        emit TokenAdded(_asset);
    }

    //BE CAREFULL of reentrency !
    function deposit(uint _amount, address _asset) external onlySupportedToken(_asset) {
        reserves[_asset].token.transferFrom(msg.sender, address(this), _amount);
        updateRewardBalance(_asset);
        balances[msg.sender][_asset].amount += _amount;
        balances[msg.sender][_asset].lastTransactTimeStamp = block.timestamp;
        emit Deposited(_amount, _asset, msg.sender);
    }

    function withdraw(uint _amount, address _asset) external onlySupportedToken(_asset) {
        // require(reserves[asset].balanceOf(address(this)) >= amount, "Withdrawing too much"); pretty sure it's useless because the transfert will simply not append
        require(getBalance(_asset) >= _amount, "Withdrawing too much");
        require(reserves[_asset].token.transfer(msg.sender, _amount), "Withdraw failed");
        updateRewardBalance(_asset);
        balances[msg.sender][_asset].amount -= _amount;
        if(getBalance(_asset) > 0 ){
            balances[msg.sender][_asset].lastTransactTimeStamp = block.timestamp;
        } else {
            balances[msg.sender][_asset].lastTransactTimeStamp = 0;
        }
        emit Withdrawn(_amount,  _asset, msg.sender);
    }

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

    function updateRewardBalance(address _asset) private onlySupportedToken(_asset) {
        rewardBalances[msg.sender] += calculateRewardEarned(_asset);
        emit RewardUpdated(rewardBalances[msg.sender], msg.sender);
    }

    function calculateRewardEarned(address _asset) private view onlySupportedToken(_asset) returns(uint) {
        //(amount * rewardPerHourOfAssetForToken) / nbrOfTokenForRewardPerhour
        uint currentBalance = getBalance(_asset);
        uint lastTransact = getLastTransact(_asset);
        uint rewardPerHourFor1TKN = reserves[_asset].rewardPerHourFor1TKN;
        if(lastTransact > 0) {
            //We have to calculate the number of rewards by hour for the current balance
            uint rewardCurrentBalance = (currentBalance * rewardPerHourFor1TKN)/(1 ether);
            //We can now calculate the rewards gained
            return ((block.timestamp - lastTransact) * rewardCurrentBalance) / 3600;
        } else {
            return 0;
        }
    }

    //This function allow to check the global rewards for any account without modifying state variables
    function calculateTotalRewardEarned() public view returns(uint) {
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


    function getBalance(address _asset) public view onlySupportedToken(_asset) returns(uint) {
        return balances[msg.sender][_asset].amount;
    }

    // This should hep fot test to get the exact reward between two times
    function getLastTransact(address _asset) public view onlySupportedToken(_asset) returns(uint) {
        return balances[msg.sender][_asset].lastTransactTimeStamp;
    }

    //used for tests
    function getReserve(address _asset) public view onlySupportedToken(_asset) returns(Reserve memory) {
        return reserves[_asset];
    }

    //used for tests
    function getRewardBalance() public view returns(uint) {
        return rewardBalances[msg.sender];
    }
}
