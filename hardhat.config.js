require('@nomicfoundation/hardhat-toolbox')
require('hardhat-deploy')
require('dotenv').config()
require('@nomiclabs/hardhat-etherscan')
require('hardhat-gas-reporter')
require('solidity-coverage')

/** @type import('hardhat/config').HardhatUserConfig */

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || 'https://eth-rinkeby'
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xkey'
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'key'
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || 'key'

module.exports = {
  solidity: { compilers: [{ version: '0.8.9' }, { version: '0.6.6' }] },
  defaultNetwork: 'hardhat',
  networks: {
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
      blockConfirmations: 6,
    },
  },
  namedAccounts: {
    deployer: {
      // one of the named accounts is deployer
      default: 0, // the account at index 0 is going to be account by default on all chains
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: 'gas-report.txt',
    noColors: true,
    currency: 'USD',
    // coinmarketcap: COINMARKETCAP_API_KEY,
    token: 'MATIC',
  },
}
