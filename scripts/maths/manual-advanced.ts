// File: scripts/maths/manual-advanced.ts
import { readFileSync } from "fs";
import hre, { tenderly } from "hardhat";
import { deployMathematitian, deployMaths } from "./maths-deployment-ethers";

export async function main() {
  // deploy stuff but later pretend it's been deployed ages ago on Ropsten.
  // 📐 Maths
  const mathsAddress = await deployMaths();
  await tenderly.verify({
    name: "Maths",
    address: mathsAddress,
  });

  // 👩‍🏫 Mathematitian (uses maths)
  const mathematitianAddress = await deployMathematitian(mathsAddress);

  // pretend it's been deployed ages ago on Ropsten in a diffrent deployment.
  // Hence we know NETWORK_ID=3 and the address of the contract (mathematitianAddress)
  const NETWORK_ID = "3";

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
          // The key is the network ID (1 for Mainnet, 3 for Ropsten)
          [NETWORK_ID]: {
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
