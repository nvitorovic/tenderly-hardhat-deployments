// File: scripts/maths/maths-deployment-ethers.ts
import { ethers } from "hardhat";

export async function deployMaths() {
  const Maths = await ethers.getContractFactory("Maths");
  console.log("📐[ethers] Deploying Maths library");
  const maths = await Maths.deploy();
  await maths.deployed();

  console.log("📐[ethers] {Maths} deployed to", maths.address);

  return maths.address;
}

export async function deployMathematitian(mathsAddress: string) {
  const Mathematitian = await ethers.getContractFactory("Mathematitian", {
    libraries: {
      Maths: mathsAddress,
    },
  });
  console.log("👩‍🏫[ethers] Deploying Mathematitian smart contract");
  const mathematitian = await Mathematitian.deploy();
  await mathematitian.deployed();
  const mathematitianAddress = mathematitian.address;

  console.log("👩‍🏫[ethers] {Mathematitian} deployed to", mathematitian.address);
  return mathematitian.address;
}
