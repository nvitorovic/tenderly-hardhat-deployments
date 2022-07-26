By default, the Tenderly Hardhat plugin performs public verification of Smart Contracts when using either automatic or manual approaches. When running private verification, the Smart Contract is verified within the project you specify. 

# How to verify Smart Contracts privately

To enable private verification, set the `privateVerification` flag and [specify your exact username and the project slug LINK]() on Tenderly. 

Next, add the following `tenderly` configuration property to your `hardhat.config.ts` and paste appropriate values instead of placeholders. There’s no need to change anything in your verification code.

```diff
// File: hardhat.config.ts
// –-snip–-
const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    --snip—-
  },
+ tenderly: {
+   project: "my-project-slug",
+   username: "my-username",
+   privateVerification: true,
+ },
};

export default config;
```

The `tenderly` section of the Hardhat user configuration consists of:

| Paramater | Description |
| --- | --- | 
| username | Your username |
| project | Your project slug |
| privateVerification | `true` \| `false`. Default value: false. |
| deploymentsDir | The path to a directory where the Tenderly Hardhat plugin stores the information about deployments. Optional. |
| forkNetwork | When running with `--network tenderly` and `networks.tenderly` is not specified in hardhat user config, the plugin creates a Fork in Tenderly based on the given network ID, and connects Ethers to that Fork. Optional. |

To try it out, run any of the deployment scripts:

```bash
npx hardhat run scripts/greeter/automatic.ts --network ropsten
```

This configuration ensures all deployments run in the private mode until you change `hardhat.config.ts` again. To switch between public and private modes on a per-run basis, without hard-coding any specific mode in the project configuration, you need to externalize the configuration. 

# How to externalize the configuration

In the case of the [example project on Git](LINK), some of the configuration is externalized using System Environment Variables. 

Here’s how the configuration references Environment Variables:

```
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as tdly from "@tenderly/hardhat-tenderly";
import * as dotenv from "dotenv";

dotenv.config();

const {
  TENDERLY_AUTOMATIC_VERIFICATION,
  TENDERLY_PRIVATE_VERIFICATION,
  TENDERLY_FORK_ID,
} = process.env;

const automaticVerification = TENDERLY_AUTOMATIC_VERIFICATION === "true";
const priaveteVerification = TENDERLY_PRIVATE_VERIFICATION === "true";

console.log(
  "Using automatic verification? ",
  automaticVerification,
  TENDERLY_AUTOMATIC_VERIFICATION
);

console.log(
  "Using private verification? ",
  priaveteVerification,
  TENDERLY_PRIVATE_VERIFICATION
);

tdly.setup({ automaticVerifications: automaticVerification });

const config: HardhatUserConfig = {
  solidity: "0.8.9",

  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL,
      accounts: !!process.env.ROPSTEN_PRIVATE_KEY
        ? [process.env.ROPSTEN_PRIVATE_KEY]
        : [],
    },

    tenderly: {
      chainId: 1,
      url: `https://rpc.tenderly.co/fork/${TENDERLY_FORK_ID}`,
    },
  },
  tenderly: {
    project: process.env.TENDERLY_PROJECT || "",
    username: process.env.TENDERLY_USERNAME || "",
    privateVerification: process.env.PRIVATE_VERIFICATION === "true",
  },
};

export default config;
```

To run advanced manual verification, execute the following command in your terminal:

```TENDERLY_PRIVATE_VERIFICATION=true \
TENDERLY_PROJECT=myProject \
TENDERLY_USERNAME=myUsername \
npx hardhat run scripts/greeter/automatic.ts --network ropsten
```

If you’re using the `dotenv` package to expose System Environment Variables to JS, place your `TENDERLY_USERNAME` and `TENDERLY_PROJECT` into the `.env` file. This way, you don’t need to specify them explicitly when running the command.
