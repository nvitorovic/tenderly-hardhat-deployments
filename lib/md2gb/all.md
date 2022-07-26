Automatic contract verification is a part of Tenderly’s Hardhat plugin. This method of verification happens seamlessly when you’re deploying a contract using Ethers.js. The only additional step is to enable the automatic verification in Tenderly in your `hardhat.config.ts` file.

```tsx
import * as tdly from "@tenderly/hardhat-tenderly";
tdly.setup({ automaticVerifications: true });
// automaticVerifications defaults to `true`, same as:
// tdly.setup();
```

The code example below deploys the `Greeter` contract and verifies it in Tenderly. The contract verification process is seamless, requiring no additional steps apart from deploying the contract.

```tsx
// File: scripts/greeter/automatic.ts
import { ethers } from "hardhat";

async function main() {
  const Greeter = await ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Hardhat!");

  await greeter.deployed();

  console.log("{Greeter} deployed to", greeter.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Next, execute the Hardhat run command:

```bash
npx hardhat run scripts/deploy.ts --network rinkeby
```

After executing the command, you’ll receive the following output:

![Output of command in terminal](./pics/automatic-terminal.png "Title")

To check whether the operation execution was successful, you should [access your Tenderly Dashboard](https://dashboard.tenderly.co/) by clicking the link printed in the console output.

In the Tenderly Dashboard, you should see something similar to the following. You’ll have an overview of the Greeter.sol with its source code. Next to it, you can see `console.sol` - a Solidity Library by Hardhat that was included automatically.

# How automatic contract verification works

When you call Ethers’ `await greeter.deployed()`, the plugin will automatically detect the contract, upload the source code, and verify it against the contract deployed on the selected network. Automatic verification is a no-code solution, which is not the case with other verification methods.

# When is automatic verification applicable?

Automatic verification works only when deploying new contracts. If you’re working with a previously deployed Smart Contract, you require a greater level of configuration control and flexibility, so you should [explore manual contract verification methods LINK](Manual%20contract%20verification%20methods%203c8360692afd428c8b4f24c143fcd97a.md).

---

In addition to automatic verification, you can verify your Smart Contracts manually in your Hardhat deployment scripts.

Manual contract verification is applicable in the following situations:

- Your Smart Contract is already deployed on a blockchain.

- You want to have more control over verification configuration.

# Manual verification methods

You can choose between two ways to manually verify a contract, including:

- **Simple**, where a single function call completes the verification process by accepting two arguments – a contract name and a contract address.

- **Advanced**, where you need to specify arguments manually with a high level of detail, which provides more freedom and flexibility throughout the verification process.

{%callout}

⚠️ **Turn off automatic verification**: Before deploying a contract using Hardhat, turn off the automatic contract verification in your `hardhat.config.ts` file by calling

```tsx
tdly.setup({ automaticVerifications: false });
```

{%/callout}

# Simple manual verification

The simple way to manually verify a contract is to call the `hre.tenderly.verify()` function and provide a reference to the contract you want to verify.

First, deploy the Greeter Smart Contract using Ethers.js following the example below:

```jsx
const Greeter = await ethers.getContractFactory("Greeter");
const greeter = await Greeter.deploy("Hello, Hardhat!");

await greeter.deployed();
```

After deploying the contract, you can verify it using the Tenderly Hardhat plugin.

To successfully verify the contract using the `.verify()` method, you need to pass a configuration object. The object consists of 2 fields:

- the exact **name** of the Smart Contract as it is in the source file and

- the **address** of your deployed Smart Contract. If you want to verify multiple contracts, you need to repeat this for each one.

{%callout}

The most common reason why verification fails is mismatch between the given `name` field and the actual name of the Smart Contract.

{%/callout}

```jsx
// File: scripts/greeter/manual-simple.ts
import { ethers, tenderly } from "hardhat";

async function main() {
  // --snip--
  tenderly.verify({
    address,
    name: "Greeter",
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

# Advanced manual verification

Advanced manual verification allows for the highest level of control over verification parameters. It enables you to specify everything from compiler settings to additional details about each contract you want to verify and the libraries your contracts use.

## Deployment example

Take a look at the code example below that demonstrates the advanced manual verification approach. The Greeter contract uses the `hardhat/console.sol` library, so we need to account for that explicitly.

With more power over configuring the verification process, you need to do provide the following key information for each contract you’re verifying (the `contracts` list):

- **For contracts**: Specify **the source code** of the Greeter Smart Contract and the address it’s deployed to on a **specific network** (or several networks).

- **For libraries**: Specify a list of all the libraries referenced by the contract as additional contracts, with the same information you’d provide to specify a contract.

```tsx
// File: scripts/greeter/manual-advanced.ts
import { readFileSync } from "fs";
import { ethers, tenderly } from "hardhat";

export async function main() {
  // deploy stuff but later pretend it's been deployed ages ago on Ropsten.
  const Greeter = await ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Manual Hardhat!");

  await greeter.deployed();
  const greeterAddress = greeter.address;
  console.log("Manual Simple: {Greeter} deployed to", greeterAddress);

  // pretend it's been deployed ages ago on Ropsten in a different deployment.
  // Hence we know NETWORK_ID=3 and the address of the contract (greeterAddress)
  const NETWORK_ID = 3;

  await tenderly.verifyAPI({
    config: {
      compiler_version: "0.8.9",
      evm_version: "default",
      optimizations_count: 200,
      optimizations_used: false,
    },
    contracts: [
      {
        contractName: "Greeter",
        source: readFileSync("contracts/Greeter.sol", "utf-8").toString(),
        sourcePath: "contracts/whatever/Greeter.sol",
        networks: {
          // The key is the network ID (1 for Mainnet, 3 for Ropsten and so on)
          [NETWORK_ID]: {
            address: greeterAddress,
            links: {},
          },
        },
      },
      {
        contractName: "console",
        source: readFileSync(
          "node_modules/hardhat/console.sol",
          "utf-8"
        ).toString(),
        sourcePath: "hardhat/console.sol",
        networks: {},
        compiler: {
          name: "solc",
          version: "0.8.9",
        },
      },
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

As seen in the example above, the two core aspects of using the `verifyApi` are:

- The compiler configuration that was used to compile deployed contracts.

- The list of contracts undergoing verification.

## The Solidity compiler _config_

The `config` property defines the necessary information about the compiler and optimizations applied during the compilation of a Smart Contract (Lines 19-24).

{%callout}

Verification can fail if the compiler config you specified differs significantly from the one actually used to compile the Smart Contract deployed on-chain.

{%/callout}

Here’s an overview of relevant configuration parameters:

| Paramater          | Type    | Description                                                                                                                                                                                                                                     |
| ------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| compiler_version   | string  | Specify the exact version of the compiler used to compile a Smart Contract                                                                                                                                                                      |
| evm_version        | string  | Specify the EVM version from a closed set of options. Here are the options you can choose from: homestead, tangerineWhistle, spuriousDragon, byzantium, constantinople, petersburg, istanbul, berlin, london. The default option is **default** |
| optimization_count | int     | The number of optimization steps. Ignored if optimizations_used is false.                                                                                                                                                                       |
| optimization_used  | boolean | Whether or not optimization was used while compiling the contract                                                                                                                                                                               |

## The list of _contracts_

The `contracts` property of the configuration is used to specify all the contracts you’re verifying (lines 26-39) and all the Solidity libraries referenced by the contracts (lines 41-51) , in a single function call.

Here’s a breakdown of the `contracts` property of the advanced verification configuration:

| Paramater           | Type   | Description                                                                                                                                                                                                                                               |
| ------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| contractName        | string | The name of the contract, as it will appear in the Tenderly dashboard. It doesn’t have to correspond to the actual name of the Smart Contract.                                                                                                            |
| source              | string | The source code of your Smart Contract(s).                                                                                                                                                                                                                |
| sourcePath          | string | **For Smart Contracts**, this is a relative path to the Smart Contract, relative to the `contracts` directory.<br/> **For libraries**, this is a relative path and it should match the one in the `import` statement within the Contract that’s using it. |
| networks            | Object | The set of networks where the contract is deployed. For Libraries that aren’t deployed, pass an empty object `{}`.                                                                                                                                        |
| networks.key        | int    | The ID of a network where contract is deployed (e.g., Mainnet is 1, Rinkeby is 4)                                                                                                                                                                         |
| networks.key.addres | string | The address of a contract deployed on a specific network                                                                                                                                                                                                  |
| networks.key.links  | Object | A link is a way to specify libraries used by the contract. It’s also referred to as linkReference or linkRef.                                                                                                                                             |

Take a look at the [Solidity library overview for more information]. (https://docs.soliditylang.org/en/v0.8.15/contracts.html?highlight=libraries

#libraries).

### Specifying libraries for Tenderly verification

Alongside the Greeter contract, you also need to send an entry corresponding to `hardhat/console.sol` Smart Contract, which is in turn a library (lines X through Y). The verification process requires the specification of all the libraries referenced by the Smart Contract.

Here are a few guidelines for specifying libraries:

- **Library source**: Retrieve the contents of `node_modules/hardhat/console.sol` and pass them as the `source` verification parameter.

- **Source path**: Pass `sourcePath` - the path to the library: `hardhat/console.sol`. It’s a relative path and it should match the path in the `import` statement in the Greeter contract.

- **Networks**: Pass an empty object (`{}`) for `networks` because `console.sol` is deployed alongside the Greeter. This means that the contract isn’t deployed separately, it’s just made available for the Tenderly Verification process. In case the library you’re using is deployed on the network, pass the actual address.

When verifying a contract that uses several libraries, each library must be explicitly specified, including the source code. Include the address of the library if it’s pre-deployed on the network or pass an empty network configuration if the library is linked to your contract at compile time.

Explore the [_example_ project in the plugin Git repo](https://github.com/Tenderly/hardhat-tenderly/examples/verification)

---

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

| Paramater           | Description                                                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| username            | Your username                                                                                                                                                                                                            |
| project             | Your project slug                                                                                                                                                                                                        |
| privateVerification | `true` \| `false`. Default value: false.                                                                                                                                                                                 |
| deploymentsDir      | The path to a directory where the Tenderly Hardhat plugin stores the information about deployments. Optional.                                                                                                            |
| forkNetwork         | When running with `--network tenderly` and `networks.tenderly` is not specified in hardhat user config, the plugin creates a Fork in Tenderly based on the given network ID, and connects Ethers to that Fork. Optional. |

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

---

The process of verification in Tenderly takes the deployed bytecode and connects the operations with the instructions in the source code. This allows Tenderly to take the bytecode execution data and link it back to the source code, for example, when showing transaction execution in Debugger and using several other Tenderly features.

# Methods of verification

There are three methods to verify a contract in Tenderly:

- [Using the Tenderly Dashboard](https://docs.tenderly.co/monitoring/verifying-a-smart-contract)

- Using the Tenderly plugin within a Hardhat project

# Modes of verification

Tenderly provides three modes of contract verification:

- **Public**: Every Tenderly user will be able to see the verified source code and use Tenderly tooling with that contract.

- **Private**: The contract is verified and thus valid within a single project in Tenderly, available to you and anybody with access to the project.

- **On a Tenderly Fork**: The contract is verified and thus valid within the Fork you deployed it to.

---

You can deploy Smart Contracts to Forks and send transactions to those contracts later on. To use Tenderly tools for the transactions simulated on a Fork, it’s necessary to verify the contracts. The process of verification on a Fork doesn’t differ much from verifying contracts on public networks.

{%callout}

Keep in mind that contracts verified on a Fork are valid only within the context of the Fork, so there’s no concept of private or public verification on a Fork.

{%/callout}

# Get a Fork JSON-RPC URL and Fork ID

Go to the Tenderly Dashboard and click “Forks” in the menu. Then, you can either:

- Pick one of the existing Forks.

- [Create a brand-new Fork](https://docs.tenderly.co/simulations-and-forks/how-to-create-a-fork)

On the Fork page, you’ll find the JSON-RPC URL you can use to access the Fork.

From this URL, extract the **Fork ID** – the last segment of the URL. In this example, the Fork ID is `2aeae177-a3e8-492f-9861-1c9aa8856235`.

# Add a Tenderly Fork as a network to the Hardhat configuration

Next, you need to further configure the Hardhat and Tenderly plugin when verifying a contract on a Fork. The additional configuration will specify the Tenderly Fork as a network so Ethers can use it for blockchain operations at a later point.

To achieve this, add the following `tenderly` property of `networks` to the Hardhat config:

```diff
// File: hardhat.config.ts
// --snip--
const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    --snip--
+  tenderly: {
+     chainId: 5582,
+     url: "https://rpc.tenderly.co/fork/2aeae177-a3e8-492f-9861-1c9aa8856235",
+   },
    --snip--
  }
};

export default config;
```

Here’s an overview of the configuration parameters used in the example above:

| chainId | The [chain ID](https://consensys.net/docs/goquorum/en/latest/concepts/network-and-chain-id/) you associate to the Fork. Use an arbitrary number, different from usual network IDs. This is to ensure that you are not vulnerable to the transaction replay attack. |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| url     | The JSON-RPC URL of your Fork. You can get it from the Fork page in the Dashboard. It follows the structure `https://rpc.tenderly.co/fork/{forkId}`, where forkId is a unique UUID identifier of the Tenderly Fork.                                                |

# Automatic & simple manual verification on a Tenderly Fork

Both automatic and simple manual verification run automatically if the configuration is accurate. You don’t need to make any adjustments to the deployment code.

**Note**: You need to pass `--network tenderly` so Hardhat uses your Fork as the network.

Use the following script to run this type of deployment and verification:

```bash

# Runs automatic verification

hardhat run scripts/greeter/automatic.ts --network tenderly

# Runs manual simple

hardhat run scripts/greeter/manual-simple.ts --network tenderly
```

Next, go back to your Fork in the Tenderly Dashboard. You should see a “Contract Creation” transaction, corresponding to the contract deployment. Click “Contracts” and you should see that the Greeter contract is verified.

# Advanced manual verification on a Tenderly Fork

The advanced manual verification of contracts on a Fork is analogous to the advanced manual verification on a public network, with a few additional settings.

**The key difference**: You have to use `tenderly.verifyForkApi` instead of `tenderly.verifyApi`. It accepts four parameters [summarized in the configuration section](LINK TO Configuration SECTION) .

**Note**: You can verify a contract you previously deployed on a Fork. The verification requires only the address of the deployed contract.

Here’s a script that deploys the Greeter contract on a Tenderly Fork and verifies it immediately:

```ts
// File: scripts/greeter/manual-advanced-fork.ts
import { readFileSync } from "fs";
import { ethers, tenderly } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const FORK_ID = process.env.TENDERLY_FORK_ID || "";

export async function main() {
  const Greeter = await ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Manual Hardhat on Fork !");

  await greeter.deployed();
  const greeterAddress = greeter.address;
  console.log("Manual Advanced (fork): {Greeter} deployed to", greeterAddress);

  tenderly.verifyForkAPI(
    {
      config: {
        compiler_version: "0.8.9",
        evm_version: "default",
        optimizations_count: 200,
        optimizations_used: false,
      },
      root: "",
      contracts: [
        {
          contractName: "Greeter",
          source: readFileSync("contracts/Greeter.sol", "utf-8").toString(),
          sourcePath: "contracts/whatever/Greeter.sol",
          networks: {
            // important: key is the Fork ID (UUID-like string)
            [FORK_ID]: {
              address: greeterAddress,
              links: {},
            },
          },
        },
        {
          contractName: "console",
          source: readFileSync(
            "node_modules/hardhat/console.sol",
            "utf-8"
          ).toString(),
          sourcePath: "hardhat/console.sol",
          networks: {},
          compiler: {
            name: "solc",
            version: "0.8.9",
          },
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
```

{%callout}

**Note**: In the `networks` segment of the configuration, we used computed property names, so the value of `FORK_ID` becomes a key in the `networks` object.

{%/callout}

To execute this script, place the proper values for `TENDERLY_PROJECT`, `TENDERLY_USERNAME`, and `TENDERLY_FORK_ID`.

```bash
TENDERLY_PRIVATE_VERIFICATION=true \
TENDERLY_PROJECT=myProject \
TENDERLY_USERNAME=myUsername \
TENDERLY_FORK_ID=2aeae177-... \
npx hardhat run scripts/greeter/manual-advanced-fork.ts --network tenderly
```

If you’re keeping these values in an externalized configuration using the `dotenv` package, place `TENDERLY_PROJECT`, `TENDERLY_USERNAME`, and `TENDERLY_FORK_ID` in the `.env` file. This simplifies the command to:

```bash
npx hardhat run scripts/greeter/manual-advanced-fork.ts --network tenderly
```

Here’s a summary of the arguments of `verifyForkAPI`:

| Parameter           | Description                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| verificationRequest | A specification of the config, root, and contracts                                                                                                              |
| username            | Your username                                                                                                                                                   |
| projectSlug         | The slug of the project enclosing the Fork                                                                                                                      |
| forkId              | The Fork ID: a unique UUID identifier of the Tenderly Fork. You can find it in the JSON-RPC URL shown in the Dashboard (https://rpc.tenderly.co/fork/{forkId}). |

## Configuring `verificationRequest`

The `verificationRequest` consists of the following parts:

- The **config** refers to the [Solidity compiler configuration](LINK The Solidity compiler _config_ section)

- The **root** ???[a][b][c][d]. Set to empty string (`root: ""`) so the contract is verified for the entire fork. To make contract valid starting with a particular simulated transaction in the fork, set it to the simulation ID (UUID assigned by Tenderly).

- The **contracts** entail a list of **contracts and libraries** you’re verifying. For more details, see [the reference for _contracts_ verification property LINK](the–list-of-contracts).

The `contracts` list represents all the contracts you’re verifying and the libraries they’re using. The main difference is that the key of each entry in the `networks` property has to be the Fork ID, like on the line 9 in the list below:

```ts
// --snip--
{
   contractName: "Greeter",
   source: readFileSync("contracts/Greeter.sol", "utf-8").toString(),
   sourcePath: "contracts/whatever/Greeter.sol",
   networks: {
     // important: key is the Fork ID (UUID-like string)
     [FORK_ID]: { // using ES6 computed properties
         address: greeterAddress,
         links: {},
     },
   },
},
// --snip–
```

[a]@nenad@tenderly.co Find out exactly what this is

_Assigned to Nenad Vitorovic_

[b]@filip@tenderly.co little help pls?

[c]"Root" is mentioned here as a route transaction in the fork. Do we want to continue on the current fork we would specify "" or fork the fork by specifying simulation id and continue the work on that specific fork

But again, this part of the request is totally going to confuse the user so it would be great if we could omit it.

[d]I added a brief brief description here without getting into details too much

---

This guide covers contract verification using the Tenderly Hardhat plugin. It explores how to verify contracts via code which can be checked into source control.

When it comes to the Tenderly Hardhat plugin, there are 3 ways to verify your Smart Contracts:

- **Automatic**: The verification happens seamlessly just after the contract is deployed. You don’t have to take any additional steps.

- **Simple manual**: You need to call the verification explicitly (`tenderly.verify()`), which requires you to pass a minimal configuration object: the name and the address.

- **Advanced manual**: You must call the verification explicitly (`tenderly.verifyAPI()`). This requires you to pass a very detailed configuration object: all the contracts involved, their source, the addresses they’re deployed at, all the libraries used, and Solidity compiler configuration.

Before starting the process of verification using one of these methods, you need to set up your development environment.

# Setting up the environment

To use a specific Tenderly contract verification method, you need a Hardhat project and Tenderly API key.

Start off with an [empty Hardhat project](https://hardhat.org/tutorial/creating-a-new-hardhat-project) and follow along with the guides. Alternatively, you can see a [complete example project on Git](LINK).

Next, make sure to successfully set your Tenderly `access_key`. Follow a few simple [steps to set up your access key in Tenderly](https://www.notion.so/How-to-setup-Tenderly-Access-Key-a074b14886224977987628809d571a19).

# Installing the Tenderly library

Once you set up your environment, make sure to install the Tenderly plugin for Hardhat:

```bash
npm install --save-dev @tenderly/hardhat-tenderly
```

After installing the Tenderly package, go to `hardhat.config.js` (or `hardhat.config.ts` if you’re using TypeScript) and import the Tenderly Hardhat library.

```tsx
import * as tdly from "@tenderly/hardhat-tenderly";
tdly.setup();
```

Take a look at the [complete Hardhat config file](https://gist.github.com/lucko515/fb36956d56fa56927ab97facae5db6fd) that uses the Tenderly plugin.

For now, remember it’s important to call `tenderly.setup()` so the plugin initializes. The plugin is in the automatic verification mode by default. In case you wish to go for manual verification, pass a configuration argument:

````tsx
tdly.setup({ automaticVerifications: false });
```.

# Using an example contract

The following examples use a simple contract automatically generated when you start a new Hardhat project - **Greeter**:

```solidity
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Greeter {
   string private greeting;

   constructor(string memory _greeting) {
       console.log("Deploying a Greeter with greeting:", _greeting);
       greeting = _greeting;
   }

   function greet() public view returns (string memory) {
       return greeting;
   }

   function setGreeting(string memory _greeting) public {
       console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
       greeting = _greeting;
   }
}
````
