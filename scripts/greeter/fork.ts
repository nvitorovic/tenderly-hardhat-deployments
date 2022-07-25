// File: scripts/greeter/fork.ts
import { readFileSync } from "fs";
import { ethers, tenderly } from "hardhat";

async function main() {
  const Greeter = await ethers.getContractFactory("Greeter");

  const greeter = await Greeter.deploy("Hello, Forked Hardhat!");
  const source = readFileSync("contracts/Greeter.sol", "utf-8").toString();

  await greeter.deployed();
  console.log("Forked {Greeter} deployed to", greeter.address);

  tenderly.verifyForkAPI(
    {
      root: "",
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
        optimizations_used: false,
      },
    },
    "test-on-fork",
    "nenad",
    process.env.TENDERLY_FORK_ID || ""
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
