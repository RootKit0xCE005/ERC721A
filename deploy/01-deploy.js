const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  // you can change deployer from hardhat.config.js
  const { deployer } = await getNamedAccounts();

  const Nft = await deploy("Erc721A_Tutorial", {
    from: deployer, // deployer
    args: ["ipfs://your_link_to_ipfs_sotrage/"], // constructor
    log: true,
  });
};

module.exports.tags = ["Nft", "all"];
