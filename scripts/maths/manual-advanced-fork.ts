// File: scripts/maths/manual-advanced.ts
import { readFileSync } from "fs";
import { tenderly } from "hardhat";
import { deployMathematitian, deployMaths } from "./maths-deployment-ethers";

const FORK_ID = process.env.TENDERLY_FORK_ID || "";

export async function main() {
  // 📐 Maths
  const mathsAddress = await deployMaths();
  tenderly.verify({
    name: "Maths",
    address: mathsAddress,
  });

  // 👩‍🏫 Mathematitian (uses maths)
  const mathematitianAddress = await deployMathematitian(mathsAddress);

  await tenderly.verifyForkAPI(
    {
      root: "",
      config: {
        compiler_version: "0.8.9",
        optimizations_used: false,
      },
      contracts: [
        {
          contractName: "Mathematitian",
          source: readFileSync(
            "contracts/Mathematitian.sol",
            "utf-8"
          ).toString(),
          sourcePath: "Mathematitian.sol",
          compiler: {
            version: "0.8.9",
          },
          networks: {
            // important: key is the Fork ID (UUID like string)
            [FORK_ID]: {
              address: mathematitianAddress,
              // Link the dependency to the deployed maths contract
              links: {
                Maths: mathsAddress,
              },
            },
          },
        },
        {
          contractName: "Maths",
          source: readFileSync(
            "contracts/libraries/Maths.sol",
            "utf-8"
          ).toString(),
          sourcePath: "libraries/Maths.sol",
          compiler: {
            version: "0.8.9",
          },
          networks: {},
        },
      ],
    },
    process.env.TENDERLY_PROJECT || "",
    process.env.TENDERLY_USERNAME || "",
    FORK_ID
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
