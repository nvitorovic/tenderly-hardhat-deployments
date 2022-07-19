import { readFileSync } from "fs";
import { ethers, tenderly } from "hardhat";
import { task } from "hardhat/config";
import { deployMathematitian, deployMaths } from "./maths-deployment-ethers";

export async function main() {
  // 📐 Maths
  const mathsAddress = await deployMaths();
  tenderly.verify({
    name: "Maths",
    address: mathsAddress,
  });

  // 👩‍🏫 Mathematitian (uses maths)
  const mathematitianAddress = await deployMathematitian(mathsAddress);

  await tenderly.verifyAPI({
    config: {
      compiler_version: "0.8.9",
      optimizations_used: false,
    },
    contracts: [
      {
        contractName: "Mathematitian",
        source: readFileSync("contracts/Mathematitian.sol").toString(),
        sourcePath: "Mathematitian.sol",
        compiler: {
          version: "0.8.9",
        },
        networks: {
          3: {
            address: mathematitianAddress,
            links: {
              Maths: mathsAddress,
            },
          },
        },
      },
      {
        contractName: "Maths",
        source: readFileSync("contracts/libraries/Maths.sol").toString(),
        sourcePath: "libraries/Maths.sol",
        compiler: {
          version: "0.8.9",
        },
        networks: {},
      },
    ],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
