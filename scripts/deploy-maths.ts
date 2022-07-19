import { ethers, tenderly } from "hardhat";

async function main() {
  const Maths = await ethers.getContractFactory("Maths");
  const maths = await Maths.deploy();
  await maths.deployed();

  console.log("Maths deployed to ", maths.address);

  tenderly.verify({
    name: "Maths",
    address: maths.address,
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
