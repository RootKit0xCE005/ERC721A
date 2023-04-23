require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

module.exports = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    //    mumbai: {
    //      url: MUMBAI_RPC_URL,
    //      accounts: [PRIVATE_KEY],
    //      blockConfirmations: 6,
    //      chainId: 80001,
    //    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gaz-price.txt",
    noColors: "false",
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
  },
  namedAccounts: {
    deployer: {
      default: 0,
      80001: 0,
      1337: 0,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.7.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};
