// SPDX-License-Identifier: MIT
// Pragma
pragma solidity ^0.8.8;

// Imports
import "./PriceConverter.sol";

// Error codes
error FundMe__NotOwner();
error FundMe__NotEnoughEth();

// Interfaces, Libraries, Contracts

/// @title A contract for crowdfunding
/// @author dahliasan
/// @notice This contract is to demo a sample funding contract
/// @dev This implements price feeds as our library

contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;

    // State Variables
    // We want to keep track of all the people who sent money to the contract
    address[] private s_funders; // create an array of sender addresses
    mapping(address => uint256) private s_addressToAmountFunded; // create mapping to lookup funders and their amount funded
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    // Events

    // Modifiers
    modifier onlyOwner() {
        // require(msg.sender == owner, "Sender is not owner!");
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // Functions Order:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /// @notice This function funds this contract
    /// @dev This implements price feeds as our library
    function fund() public payable {
        // require(
        //     msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
        //     "You need to spend more ETH!"
        // ); // 1e18 == 1 * 10 ** 18 == 1 000 000 000 000 000 000 000 wei == 1  ETH

        if (msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD)
            revert FundMe__NotEnoughEth();
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    /// @notice This function allows contract owner to withdraw funds
    function withdraw() public onlyOwner {
        // Reset the mapping - the only way to reset mapping is to iterate through the keys - can't do it like how we do it for arrays.
        /* starting index, ending index, step amount */
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            // code
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        // Reset the array
        s_funders = new address[](0); // new address array with 0 elements

        // actually withdraw the funds
        // Transfer vs call vs Send
        // payable(msg.sender).transfer(address(this).balance);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;

        // Reset mapping
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        // Reset array
        s_funders = new address[](0);

        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    // Public / View functions
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
