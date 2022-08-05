# Alyra DeFi  project

This is our collaborative DeFi project for the Alya school. 

## Installation Dev
You have to have cloned the project.
Tou need to have truffle installed...


For developpement install the following

```sh
$ cd truffle
$ npm init -y
$ npm install --prefix . dotenv @truffle/hdwallet-provider @openzeppelin/contracts
$ npm install --prefix . dotenv @openzeppelin/ownable
$ npm install --prefix . @chainlink/contracts
$ yarn add @fontsource/montserrat
$ yarn add @mui/material @emotion/react @emotion/styled // collection of CSS utilities to lay out custom designs
$ yarn add zustand // fast and scalable bearbones state-management solution
$ yarn add react-toastify // popup notifications
```

For the tests install the following

```sh
$ npm install @openzeppelin/contracts --save
$ npm install @openzeppelin/test-helpers --save
$ npm install eth-gas-reporter
```

To test the chainlink features, you need to have a .env properly configured and you can do the following :
```sh
$ truffle migrate --network kovan
$ truffle console --network kovan (ou script)

$ let D4AInstance = await D4Atoken.new();
$ D4AInstance
$ let MarketInstance = await Market.new(D4AInstance.address);
$ await MarketInstance.addToken(D4AInstance.address, BigInt(1 * 10 ** 18), "DAI");
$ let price = await MarketInstance.priceOf(D4AInstance.address);
$ price.toString();
```