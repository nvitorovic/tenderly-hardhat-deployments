This guide covers contract verification using the Tenderly Hardhat plugin. It explores how to verify contracts via code which can be checked into source control.

When it comes to the Tenderly Hardhat plugin, there are 3 ways to verify your Smart Contracts:

   * **Automatic**: The verification happens seamlessly just after the contract is deployed. You don’t have to take any additional steps.

   * **Simple manual**: You need to call the verification explicitly (`tenderly.verify()`), which requires you to pass a minimal configuration object: the name and the address.

   * **Advanced manual**: You must call the verification explicitly (`tenderly.verifyAPI()`). This requires you to pass a very detailed configuration object: all the contracts involved, their source, the addresses they’re deployed at, all the libraries used, and Solidity compiler configuration.

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

```tsx
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
```
