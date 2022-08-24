// Script that allows us to fund our contracts

const { getNamedAccounts, ethers } = require('hardhat')

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract('FundMe', deployer)
  console.log('Funding contract...')
  const txnResponse = await fundMe.fund({
    value: ethers.utils.parseEther('0.05'),
  })
  await txnResponse.wait(1)
  console.log('Funded!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
