// File: scripts/maths/automatic.ts
import { tenderly } from "hardhat";
import { deployMathematitian, deployMaths } from "./maths-deployment-ethers";

async function main() {
  // 📐 Maths (uses maths)
  console.log("📐 [tenderly] Deploying & autoverifying Maths in Tenderly");
  const mathsAddress = await deployMaths();

  // 👩‍🏫 Mathematitian (uses maths)
  const mathematitianAddress = await deployMathematitian(mathsAddress);

  console.log("👩‍🏫[tenderly] Deploying & autoverifying in Tenderly");

  tenderly.verify({
    name: "Mathematitian",
    address: mathematitianAddress,
    libraries: {
      Maths: mathsAddress,
    },
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
