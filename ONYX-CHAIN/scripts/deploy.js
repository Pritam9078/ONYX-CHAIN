// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  // Deploy the OnyxChainStorage contract
  const OnyxChainStorage = await hre.ethers.getContractFactory("OnyxChainStorage");
  const storage = await OnyxChainStorage.deploy();
  await storage.waitForDeployment();

  const address = await storage.getAddress();
  console.log("OnyxChainStorage deployed to:", address);
  
  // For testing - set a lower storage fee
  const tx = await storage.updateStorageFee(100); // 100 wei per byte
  await tx.wait();
  console.log("Storage fee updated for testing");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});