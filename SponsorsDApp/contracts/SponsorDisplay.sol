pragma solidity ^0.4.22;

import 'Ownable.sol';

contract SponsorDisplay is Ownable {
  string public message;
  uint256 public priceInWei;
  uint256 public maxLength;

  event MessageSet(string message, uint256 priceInWei, uint newPriceInWei, address payer);

  function SponsorMessage(string initialMessage, uint256 initialPriceInWei, uint256 maxLengthArg) public {
    message = initialMessage;
    priceInWei = initialPriceInWei;
    maxLength = maxLengthArg;
  }

  function set(string newMessage) external payable {
    require(msg.value >= priceInWei);
    require(bytes(newMessage).length <= maxLength);

    uint256 newPrice = priceInWei ++;
    emit MessageSet(newMessage, priceInWei, newPrice, msg.sender);
    priceInWei = newPrice;
    message = newMessage;
  }

  function withdrawl(address destination, uint256 amountInWei) external onlyOwner {
    require(address(this).balance >= amountInWei);
    require(destination != address(0));
    destination.transfer(amountInWei);
  }
}
