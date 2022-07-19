import { readFileSync } from "fs";
import { ethers, tenderly } from "hardhat";
import * as hre from "hardhat";

async function main() {
  const Greeter = await ethers.getContractFactory("Greeter");

  const greeter = await Greeter.deploy("Hello, Forked Hardhat!");
  const source = readFileSync("contracts/Greeter.sol").toString();

  await greeter.deployed();
  tenderly.verifyForkAPI(
    {
      contracts: [
        {
          contractName: "Greeter",
          source,
          sourcePath: "contracts/Greeter.sol",
          networks: {
            3: {
              address: greeter.address,
              links: {},
            },
          },
        },
      ],
      config: {
        compiler_version: "0.8.9",
        evm_version: "default",
        //   optimizations_count: 200,
        //   optimizations_used: false,
      },
      root: "",
    },
    "test-on-fork",
    "nenad",
    process.env.TENDERLY_FORK_ID || ""
  );
  console.log("Forked Greeter deployed to fork:", greeter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
