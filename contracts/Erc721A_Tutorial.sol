// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/ERC721A.sol";
import "hardhat/console.sol"; 


contract Erc721A_Tutorial is ERC721A, Ownable {
  bool public paused = false;
  uint16 constant maxSupply = 10000;
  string public baseURI;
  uint256 public cost = 0.1 ether;

  error CONTRACT_PAUSED();
  error MAX_NFT_LIMIT_EXCEEDED();
  error INSUFFICIENT_FUNDS();
  error WITHDRAW_FAILED();
  error INVALID_ADDRESS();

  constructor( 
    string memory _initBaseURI
  ) ERC721A("Rootkit0xCE", "RK") {
    setBaseURI(_initBaseURI);
  }

  function mint(uint256 _mintAmount) public payable {
    if(paused) revert CONTRACT_PAUSED();
    if(totalSupply() + _mintAmount > maxSupply) revert MAX_NFT_LIMIT_EXCEEDED();

    if (msg.sender != owner()) {
      uint256 totalCost = cost * _mintAmount; 
      if(msg.value < totalCost) revert INSUFFICIENT_FUNDS();

      // in case sender sent more than it required
      assembly {
        if gt(callvalue(), totalCost) {
          if iszero(call(gas(), caller(), sub(callvalue(), totalCost), 0x00, 0x00, 0x00, 0x00)) {
            revert(0, 0)
          }
        }
      }
    }

    // ERC721A uses _mint Function to save
    // NFT mintting gaz
    _mint(msg.sender, _mintAmount);
  }

  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
    return bytes(baseURI).length != 0 ? string.concat(baseURI, _toString(tokenId), ".json") : '';
  }

  // totalMinted
  function totalMinted() public view returns(uint256) {
    return _totalMinted(); 
  }

  //================ onlyOwner ================//
  //===========================================//

  function transferOwnership(address newOwner) public override onlyOwner {
    if(newOwner == address(0)) revert INVALID_ADDRESS(); 
    _transferOwnership(newOwner);
  }

  // change the cost of NFTs
  function setCost(uint256 _newCost) public onlyOwner {
    cost = _newCost;
  }

  // returns baseURI
  function setBaseURI(string memory _newBaseURI) public onlyOwner {
    baseURI = _newBaseURI;
  }

  // pause the contract
  function pause(bool _state) public onlyOwner {
    paused = _state;
  }
  
  // withdraw the funds
  function withdraw(address _to) public onlyOwner {
    (bool check, ) = payable(_to).call{value: address(this).balance}("");
    if(!check) revert WITHDRAW_FAILED();
  }
}

