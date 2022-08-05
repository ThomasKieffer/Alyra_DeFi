// SPDX-License-Identifier: MIT

pragma solidity 0.8.14;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract ChainlinkKovanUSD {
    mapping(string => address) ERC20ToUSD;

    /* Network: Kovan  */

    constructor() {
        ERC20ToUSD['BAT']   = 0x8e67A0CFfbbF6A346ce87DFe06daE2dc782b3219;
        ERC20ToUSD['BNB']   = 0x8993ED705cdf5e84D0a3B754b5Ee0e1783fcdF16;
        ERC20ToUSD['BTC']   = 0x6135b13325bfC4B00278B4abC5e20bbce2D6580e;
        ERC20ToUSD['CHF']   = 0xed0616BeF04D374969f302a34AE4A63882490A8C;
        ERC20ToUSD['COMP']  = 0xECF93D14d25E02bA2C13698eeDca9aA98348EFb6;
        ERC20ToUSD['AUD']   = 0x5813A90f826e16dB392abd2aF7966313fc1fd5B8;
        ERC20ToUSD['DAI']   = 0x777A68032a88E5A84678A77Af2CD65A7b3c0775a;
        ERC20ToUSD['ETH']   = 0x9326BFA02ADD2366b30bacB125260Af641031331;
        ERC20ToUSD['EUR']   = 0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13;
        ERC20ToUSD['FORTH'] = 0xC9129FAC7Ce4D3dC72714fd9d5285FB2fDB52592;
        ERC20ToUSD['GBP']   = 0x28b0061f44E6A9780224AA61BEc8C3Fcb0d37de9;
        ERC20ToUSD['JPY']   = 0xD627B1eF3AC23F1d3e576FA6206126F3c1Bd0942;
        ERC20ToUSD['KRW']   = 0x9e465c5499023675051517E9Ee5f4C334D91e369;
        ERC20ToUSD['LINK']  = 0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0;
        ERC20ToUSD['LTC']   = 0xCeE03CF92C7fFC1Bad8EAA572d69a4b61b6D4640;
        ERC20ToUSD['Oil']   = 0x48c9FF5bFD7D12e3C511022A6E54fB1c5b8DC3Ea;
        ERC20ToUSD['PHP']   = 0x84fdC8dD500F29902C99c928AF2A91970E7432b6;
        ERC20ToUSD['REP']   = 0x8f4e77806EFEC092A279AC6A49e129e560B4210E;
        ERC20ToUSD['SNX']   = 0x31f93DA9823d737b7E44bdee0DF389Fe62Fd1AcD;
        ERC20ToUSD['TRX']   = 0x9477f0E5bfABaf253eacEE3beE3ccF08b46cc79c;
        ERC20ToUSD['TSLA']  = 0xb31357d152638fd1ae0853d24b9Ea81dF29E3EF2;
        ERC20ToUSD['UNI ']  = 0xDA5904BdBfB4EF12a3955aEcA103F51dc87c7C39;
        ERC20ToUSD['USDC '] = 0x9211c6b3BF41A10F78539810Cf5c64e1BB78Ec60;
        ERC20ToUSD['VELO']  = 0x6d393f929E213D2Ca67A7FA73108A42b884F5f74;
        ERC20ToUSD['XAG']   = 0x4594051c018Ac096222b5077C3351d523F93a963;
        ERC20ToUSD['XAU']   = 0xc8fb5684f2707C82f28595dEaC017Bfdf44EE9c5;
        ERC20ToUSD['XRP']   = 0x3eA2b7e3ed9EA9120c3d6699240d1ff2184AC8b3;
        ERC20ToUSD['XTZ']   = 0xC6F39246494F25BbCb0A8018796890037Cb5980C;
        ERC20ToUSD['ZRX']   = 0x24D6B177CF20166cd8F55CaaFe1c745B44F6c203;
        ERC20ToUSD['sCEX']  = 0xA85646318D20C684f6251097d24A6e74Fe1ED5eB;
    }

    function getLatestPrice(string memory _symbol) public view returns (int256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(ERC20ToUSD[_symbol]);
        (
            ,
            /*uint80 roundID*/
            int256 price, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
            ,
            ,

        ) = priceFeed.latestRoundData();

        return price;
    }
}