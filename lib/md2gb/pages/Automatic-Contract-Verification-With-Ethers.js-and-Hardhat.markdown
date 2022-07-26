Automatic contract verification is a part of Tenderly’s Hardhat plugin. This method of verification happens seamlessly when you’re deploying a contract using Ethers.js. The only additional step is to enable the automatic verification in Tenderly in your `hardhat.config.ts` file. 

```tsx
import * as tdly from "@tenderly/hardhat-tenderly";
tdly.setup({ automaticVerifications: true });
// same as
// tdly.setup();
```

The code example below deploys the `Greeter` contract and verifies it in Tenderly. The contract verification process is seamless, requiring no additional steps apart from deploying the contract. 

```tsx
// File: scripts/greeter/automatic.ts
import { ethers } from "hardhat";
//HELLOOOOOUUUU
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

When you call Ethers’ `await greeter.deployed()`, the plugin will automatically detect the contract, upload the source code, and verify it against the contract deployed on the selected network. Automatic verification does all the work you’d have to do if you [used advanced manual verification LINK](LINK).

# When is automatic verification applicable?

Automatic verification works only when deploying new contracts. If you’re working with a previously deployed Smart Contract, you require a greater level of configuration control and flexibility, so you should [explore manual contract verification methods LINK](Manual%20contract%20verification%20methods%203c8360692afd428c8b4f24c143fcd97a.md).
