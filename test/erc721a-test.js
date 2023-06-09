const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther, formatEther } = require("ethers/lib/utils");
const { setBalance } = require("@nomicfoundation/hardhat-network-helpers");

describe("[ ERC721A Test ]\n", () => {
  let deployerWallet, thanosWallet, jokerWallet;
  let deployerAddress, thanosAddress, jokerAddress;
  let cost1, cost2;
  let ipfsUri = "ipfs://your_link_to_ipfs_sotrage/";

  beforeEach(async () => {
    [user0, user1, user2] = await ethers.getSigners();

    contract = await (
      await ethers.getContractFactory("Erc721A_Tutorial")
    ).deploy(ipfsUri);
    contract.deployed();

    // setup the callers
    deployerWallet = contract.connect(user0);
    thanosWallet = contract.connect(user1);
    jokerWallet = contract.connect(user2);

    deployerAddress = user0.address;
    thanosAddress = user1.address;
    jokerAddress = user2.address;

    cost1 = parseEther("0.5");
    cost2 = parseEther("1.5");

    // check the owner
    expect(await contract.owner()).to.eq(deployerAddress);
  });

  describe("Mint Function", () => {
    beforeEach(async () => {
      await thanosWallet.mint(5, { value: cost1 });
      await jokerWallet.mint(15, { value: cost2 });
    });

    it("should mint nfts", async () => {
      expect(await thanosWallet.balanceOf(thanosAddress)).to.eq(5);
      expect(await jokerWallet.balanceOf(jokerAddress)).to.eq(15);

      expect(await ethers.provider.getBalance(contract.address)).to.eq(
        // cost1 + cost2
        parseEther("2")
      );
    });

    it("should revert if didn't send enough ether ", async () => {
      // try to mint 10 nfts with 0.5
      await expect(thanosWallet.mint(10, { value: cost1 })).to.reverted;
    });

    it("should buyers owns the nfts", async () => {
      for (let i = 0; i < 5; i++)
        expect(await thanosWallet.ownerOf(i)).to.eq(thanosAddress);

      for (let i = 5; i < 20; i++)
        expect(await jokerWallet.ownerOf(i)).to.eq(jokerAddress);
    });

    it("Revert if contract paused", async () => {
      await contract.pause(true);
      await expect(deployerWallet.mint(5, { value: cost1 })).to.reverted;
    });

    it("Revert if max nft limit exceeded", async () => {
      // we minted 20 nfts + 9980 == 10000
      await deployerWallet.mint(9980);
      // if 10000 is minted we cant mint any more
      await expect(deployerWallet.mint(1)).to.reverted;
    });

    it("return eth if user sent more than it required", async () => {
      setBalance(thanosAddress, parseEther("5"));
      await contract.connect(user1).mint(10, { value: parseEther("4") });

      expect(await ethers.provider.getBalance(thanosAddress)).to.gt(
        parseEther("3")
      );
    });
  });

  describe("Other functiosn", () => {
    it("Get tokenUri", async () => {
      await thanosWallet.mint(5, { value: cost1 });
      expect(await deployerWallet.tokenURI(1)).to.eq(ipfsUri + "1.json");
    });

    it("total minted should equal 10000", async () => {
      await deployerWallet.mint(10000);
      expect(await deployerWallet.totalMinted()).to.eq(10000);
    });
  });

  describe("OnlyOwner functions", () => {
    it("should transfer Ownership", async () => {
      await deployerWallet.transferOwnership(thanosAddress);
      expect(await deployerWallet.owner()).to.eq(thanosAddress);
    });

    it("should change baseURI", async () => {
      newBaseURI = "ipfs://123456789Abcdefj/";

      await deployerWallet.setBaseURI(newBaseURI);
      expect(await deployerWallet.baseURI()).to.eq(newBaseURI);
    });

    it("nft cost should be updated", async () => {
      newPrice = parseEther("1");

      await deployerWallet.setCost(newPrice);
      expect(await contract.cost()).to.eq(newPrice);
    });

    it("only Owner should be able to withdraw", async () => {
      await expect(thanosWallet.withdraw(thanosAddress)).to.reverted;
      await expect(deployerWallet.withdraw(deployerAddress)).not.to.reverted;

      // send contract balance to deployerWallet address
      expect(await ethers.provider.getBalance(contract.address)).to.eq(0);
    });
  });

  after("", async () => {});
});
