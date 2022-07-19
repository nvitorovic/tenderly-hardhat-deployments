import { ethers, tenderly } from "hardhat";
import { deployMathematitian, deployMaths } from "./maths-deployment-ethers";

async function main() {
  // 📐 Mathematitian (uses maths)
  const mathsAddress = await deployMaths();

  console.log("📐[ethers] Verifying Maths in Tenderly");

  tenderly.verify({
    name: "Maths",
    address: mathsAddress,
  });

  // 👩‍🏫 Mathematitian (uses maths)
  const mathematitianAddress = await deployMathematitian(mathsAddress);

  console.log("👩‍🏫[tenderly] Verifying Mathematitian in Tenderly");

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
