# Sample Hardhat Project

## Automatic

```bash
export TENDERLY_AUTOMATIC_VERIFICATION=true; \
npx hardhat run scripts/deploy-automatic.ts --network ropsten; \
unset TENDERLY_AUTOMATIC_VERIFICATION
```

Output:

```bash
Using automatic verification?  true
Using automatic verification?  true
undefined
Smart Contracts successfully verified
  Contract 0xdf5f077b6940b34fd181f68808269702562ba7d0 verified. You can view the contract at https://dashboard.tenderly.co/contract/ropsten/0xdf5f077b6940b34fd181f68808269702562ba7d0
Greeter deployed to: 0xdF5F077B6940B34fD181f68808269702562Ba7D0
```

- hardhat.config called twice
- has `undefined` printed out
- line break before `You can verify...` will make it prettier

## Manual (simple)

```bash
export TENDERLY_AUTOMATIC_VERIFICATION=false; \
npx hardhat run scripts/deploy-manual-simple.ts --network ropsten; \
unset TENDERLY_AUTOMATIC_VERIFICATION;
```

output:

```
Using automatic verification?  false false
Using automatic verification?  false false
Manual Greeter deployed to: 0x3eF4dC2BE553B9ADD990dE17618133dF56a310Ce
Error in hardhat-tenderly: No compiler configuration found for the contracts
[
  {
    address: '0x3eF4dC2BE553B9ADD990dE17618133dF56a310Ce',
    name: 'Simple Manual Greeter'
  }
]
```

- script called twice
- unclear error

## Manual (advanced)

```bash
export TENDERLY_AUTOMATIC_VERIFICATION=false; \
npx hardhat run scripts/deploy-manual-complex.ts --network ropsten; \
unset TENDERLY_AUTOMATIC_VERIFICATION
```

Output:
```bash
Using automatic verification?  false false
Using automatic verification?  false false
Manual Greeter deployed to: 0xFC80b31786cdA6B59A1d2241143308f96bDB10fc
Unexpected error occurred. 
  Error reason 422 Unprocessable Entity. 
  Error context: Error during source code compiling
Error in hardhat-tenderly: Verification failed. There was an error during the API request, please contact support with the above error.
```

# Fork

```bash
export TENDERLY_AUTOMATIC_VERIFICATION=false; \
npx hardhat run scripts/deploy-fork.ts --network tenderly; \
unset TENDERLY_AUTOMATIC_VERIFICATION
    
```

Output
```bash
Using automatic verification?  false false
Using automatic verification?  false false
Forked Greeter deployed to fork: 0xb3a0eE26ddc5fD960d6Af825D7665EF688b78b4f
Unexpected error occurred. 
  Error reason 400 Bad Request. 
  Error context: {"error":{"errors":[{"source_location":{"file":"contracts/Greeter.sol","start":62,"end":91},"error_type":"ParserError","component":"general","message":"Source \"hardhat/console.sol\" not found: File not found.","formatted_message":""}],"message":"Error during source code compiling","slug":"compile_error"}}
Error in hardhat-tenderly: Verification failed. There was an error during the API request, please contact support with the above error.
```

# Questions now+future:
- How to use `links` to map out referenced libraries? (what's the key, what's the value). Example would be good.
- How to handle solidity imports properly?
