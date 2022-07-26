You can deploy Smart Contracts to Forks and send transactions to those contracts later on. To use Tenderly tools for the transactions simulated on a Fork, it’s necessary to verify the contracts. The process of verification on a Fork doesn’t differ much from verifying contracts on public networks.

{%callout}

Keep in mind that contracts verified on a Fork are valid only within the context of the Fork, so there’s no concept of private or public verification on a Fork.

{%/callout}

# Get a Fork JSON-RPC URL and Fork ID

Go to the Tenderly Dashboard and click “Forks” in the menu. Then, you can either:

   * Pick one of the existing Forks.

   * [Create a brand-new Fork](https://docs.tenderly.co/simulations-and-forks/how-to-create-a-fork)

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
| --- | --- |
| url | The JSON-RPC URL of your Fork. You can get it from the Fork page in the Dashboard. It follows the structure `https://rpc.tenderly.co/fork/{forkId}`, where forkId is a unique UUID identifier of the Tenderly Fork. |

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

| Parameter | Description|
| --- | --- |
| verificationRequest | A specification of  the config, root, and contracts |
| username | Your username |
| projectSlug | The slug of the project enclosing the Fork |
| forkId | The Fork ID: a unique UUID identifier of the Tenderly Fork. You can find it in the JSON-RPC URL shown in the Dashboard (https://rpc.tenderly.co/fork/{forkId}). |

## Configuring `verificationRequest`

The `verificationRequest` consists of the following parts:

   * The **config** refers to the [Solidity compiler configuration](LINK The Solidity compiler *config* section)

   * The **root** ???[a][b][c][d]. Set to empty string (`root: ""`) so the contract is verified for the entire fork. To make contract valid starting with a particular simulated transaction in the fork, set it to the simulation ID (UUID assigned by Tenderly).

   * The **contracts** entail a list of **contracts and libraries** you’re verifying. For more details, see [the reference for *contracts* verification property LINK](the–list-of-contracts).

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
