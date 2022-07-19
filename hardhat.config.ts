import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as tdly from "@tenderly/hardhat-tenderly";
import * as dotenv from "dotenv";

dotenv.config();

const {
  TENDERLY_AUTOMATIC_VERIFICATION,
  TENDERLY_PRIVATE_VERIFICATION,
  TENDERLY_PROJECT,
  TENDERLY_USERNAME,
} = process.env;

const automaticVerification = TENDERLY_AUTOMATIC_VERIFICATION === "true";

console.log(
  "Using automatic verification? ",
  automaticVerification,
  TENDERLY_AUTOMATIC_VERIFICATION
);

tdly.setup({ automaticVerifications: automaticVerification });

const config: HardhatUserConfig = {
  solidity: "0.8.9",

  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.ROPSTEN_INFURA_KEY}`,
      accounts: !!process.env.ROPSTEN_PRIVATE_KEY
        ? [process.env.ROPSTEN_PRIVATE_KEY]
        : [],
    },

    tenderly: {
      chainId: 1,
      url: `https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_ID}`,
    },
  },
  tenderly: {
    project: TENDERLY_PROJECT || "",
    username: TENDERLY_USERNAME || "",
    privateVerification: TENDERLY_PRIVATE_VERIFICATION === "true",
  },
};

export default config;
