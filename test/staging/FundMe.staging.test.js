// Staging tests are tests you run right before to deploy to mainnet
// (last step in development journey to make sure everything is working correctly on a test net)

const { getNamedAccounts, ethers, network } = require('hardhat')
const { developmentChains } = require('../../helper-hardhat-config')
const { assert } = require('chai')

developmentChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', () => {
      let fundMe
      let deployer
      const sendValue = ethers.utils.parseEther('0.05')

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract('FundMe', deployer)
      })

      it('allows people to fund and withdraw', async () => {
        await fundMe.fund({ value: sendValue })
        //   await fundMe.withdraw()
        await fundMe.cheaperWithdraw()
        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        )
        console.log(
          endingFundMeBalance.toString() +
            ' should equal 0, running assert equal...'
        )
        assert.equal(endingFundMeBalance.toString(), '0')
      })
    })
