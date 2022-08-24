const { assert, expect } = require('chai')
const { deployments, ethers, getNamedAccounts, network } = require('hardhat')
const { developmentChains } = require('../../helper-hardhat-config')

!developmentChains.includes(network.name) // Our unit tests will only run on development chains
  ? describe.skip
  : describe('FundMe', () => {
      let fundMe
      let deployer
      let mockV3Aggregator
      const sendValue = ethers.utils.parseEther('1') // 1 eth

      beforeEach(async () => {
        // deploy our fundMe contract using hardhat-deploy
        // const accounts = ethers.getSigners()
        // const accountZero = accounts[0]
        deployer = (await getNamedAccounts()).deployer // get the account that deployed the contract
        await deployments.fixture(['all'])
        fundMe = await ethers.getContract('FundMe', deployer) // gets the latest deployed FundMe contract
        mockV3Aggregator = await ethers.getContract(
          'MockV3Aggregator',
          deployer
        )
      })

      describe('constructor', () => {
        it('sets the aggregator addresses correctly', async () => {
          const response = await fundMe.getPriceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })

      describe('fund', async () => {
        it("fails if you don't send enough eth", async () => {
          await expect(fundMe.fund()).to.be.revertedWithCustomError(
            fundMe,
            'FundMe__NotEnoughEth'
          )
        })

        it('updates the amount funded data structure', async () => {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.getAddressToAmountFunded(deployer)
          assert.equal(response.toString(), sendValue.toString())
        })

        it('adds funder to array of s_funders', async () => {
          await fundMe.fund({ value: sendValue })
          const funder = await fundMe.getFunders(0)
          assert.equal(funder, deployer)
        })
      })

      describe('withdraw', async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue })
        })

        it('withdraw ETH from a single founder', async () => {
          // arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // act
          const txnResponse = await fundMe.withdraw()
          const txnReceipt = await txnResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = txnReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })

        it('allows us to withdraw with multiple funders', async () => {
          // arrange
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectContract = await fundMe.connect(accounts[i])
            await fundMeConnectContract.fund({ value: sendValue })
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // act
          const txnResponse = await fundMe.withdraw()
          const txnReceipt = await txnResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = txnReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
          // Make sure that the funders array is reset properly
          await expect(fundMe.getFunders(0)).to.be.reverted
          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })

        it('only allows the owner to withdraw', async () => {
          const accounts = await ethers.getSigners()
          const fundMeConnectedContract = await fundMe.connect(accounts[1])
          await expect(
            fundMeConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner')
        })

        it('cheaperWithdraw testing...', async () => {
          // arrange
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectContract = await fundMe.connect(accounts[i])
            await fundMeConnectContract.fund({ value: sendValue })
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // act
          const txnResponse = await fundMe.cheaperWithdraw()
          const txnReceipt = await txnResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = txnReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
          // Make sure that the funders array is reset properly
          await expect(fundMe.getFunders(0)).to.be.reverted
          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })
      })
    })
