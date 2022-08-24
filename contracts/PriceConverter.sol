// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        (
            ,
            /*uint80 roundID*/
            int price, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
            ,
            ,

        ) = priceFeed.latestRoundData(); // note it's int instead of uint because price can also have negative numbers. by default int is int256
        return uint256(price * 1e10); // we want the number of decimals to match up with msg.value (which has 18 decimals). since price has 8 decimals, we * 1e10 to make it 18 decimals. also msg.value is in uint256 - so we convert price which is in int to become uint256 this is called typecasting.
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPriceInUsd = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPriceInUsd * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
