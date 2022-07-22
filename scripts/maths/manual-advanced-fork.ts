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

  // TODO: rename/alias TenderlyForkContractUploadRequest with something more sensible
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
          source: readFileSync("contracts/Mathematitian.sol").toString(),
          sourcePath: "Mathematitian.sol",
          compiler: {
            version: "0.8.9",
          },
          networks: {
            // important: key is the Fork ID (UUID like string)
            // TODO: can we make it prettier?
            [FORK_ID]: {
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
    },
    // TODO: make these optional, use the config coming hardhat config
    process.env.TENDERLY_PROJECT || "",
    process.env.TENDERLY_USERNAME || "",
    FORK_ID
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
