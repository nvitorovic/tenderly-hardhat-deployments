The process of verification in Tenderly takes the deployed bytecode and connects the operations with the instructions in the source code. This allows Tenderly to take the bytecode execution data and link it back to the source code, for example, when showing transaction execution in Debugger and using several other Tenderly features.

# Methods of verification 

There are three methods to verify a contract in Tenderly:

* [Using the Tenderly Dashboard](https://docs.tenderly.co/monitoring/verifying-a-smart-contract)

* Using the Tenderly plugin within a Hardhat project

# Modes of verification 

Tenderly provides three modes of contract verification:

* **Public**: Every Tenderly user will be able to see the verified source code and use Tenderly tooling with that contract.

* **Private**: The contract is verified and thus valid within a single project in Tenderly, available to you and anybody with access to the project.

* **On a Tenderly Fork**: The contract is verified and thus valid within the Fork you deployed it to.
