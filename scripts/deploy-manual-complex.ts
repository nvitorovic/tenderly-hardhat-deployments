import { readFileSync } from "fs";
import { ethers, tenderly } from "hardhat";

export async function main() {
  const Greeter = await ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Manual Hardhat!");

  await greeter.deployed();
  tenderly.verifyAPI({
    contracts: [
      {
        contractName: "Greeter",
        source: readFileSync("contracts/Greeter.sol", {
          encoding: "utf-8",
        }).toString(),
        sourcePath: "contracts/whatever/Greeter.sol",
        networks: {
          3: {
            address: "0xbb246bd2cc38022f40e45b11eda28d8ad4487595",
            links: {},
          },
        },
      },
      {
        contractName: "console",
        source: readFileSync("node_modules/hardhat/console.sol", {
          encoding: "utf-8",
        }).toString(),
        sourcePath: "hardhat/console.sol",
        networks: {},
        compiler: {
          name: "solc",
          version: "0.8.9",
        },
      },
    ],
    config: {
      compiler_version: "0.8.9",
      evm_version: "default",
      optimizations_count: 200,
      optimizations_used: false,
    },
  });
  console.log(
    "Manual Greeter deployed to:",
    "0xbb246bd2cc38022f40e45b11eda28d8ad4487595"
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
