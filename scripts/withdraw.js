// Script to withdraw funds from our contracts
const { ethers, getNamedAccounts } = require('hardhat')

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract('FundMe', deployer)
  let fundMeContractBalance = await fundMe.provider.getBalance(fundMe.address)
  console.log('Contract funds = ', fundMeContractBalance.toString())
  console.log('Withdrawing funds...')
  const txnResponse = await fundMe.withdraw()
  await txnResponse.wait(1)
  console.log('Withdraw success!')
  fundMeContractBalance = await fundMe.provider.getBalance(fundMe.address)
  console.log('Contract funds = ', fundMeContractBalance.toString())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
