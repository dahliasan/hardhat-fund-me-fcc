// import
// deploy function

// method 1:
// function deployFunc() {
//     console.log('hi!')
// }
// module.exports.default = deployFunc

const { networkConfig, developmentChains } = require('../helper-hardhat-config')
const { network } = require('hardhat')
const { verify } = require('../utils/verify')

// method 2:
module.exports = async ({ getNamedAccounts, deployments }) => {
  // pull out getNamedAccounts and deployments object from hre in the function above

  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts() // get named accounts
  const chainId = network.config.chainId

  // if chainId = X, use address address A
  // if chainId = Y, use address address B

  let ethUsdOPriceFeedAddress
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get('MockV3Aggregator')
    ethUsdOPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdOPriceFeedAddress = networkConfig[chainId]['ethUsdPriceFeed']
  }

  // when going for localhost or hardhat network we want to use a mock
  const args = [ethUsdOPriceFeedAddress]
  const fundMe = await deploy('FundMe', {
    // fundMe = name of our contract
    from: deployer,
    args: args, // put price feed address. The goal of putting address to not have to hardcode it.
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // verify contract
    await verify(fundMe.address, args)
  }

  log('----------------------------------------------------------------')
}

module.exports.tags = ['all', 'fundme']
