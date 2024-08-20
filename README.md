# Sequencer

## Setup

The applications needs a .env folder with the following:

```
CHAIN_URL="https://drand.cloudflare.com/52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971"
CHAIN_HASH="52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971"
CHAIN_PUBLIC_KEY="83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a"
WALLET_PRIVATE_KEY="<YOUR PRIVATE KEY>"
WALLET_PUBLIC_KEY="<YOUR PUBLIC KEY>"
MAX_DRAND_TIMEOUT=10
CONTRACT_ADDRESS=""
```

Script.sh needs private key applying

```
forge script Deploy --fork-url http://127.0.0.1:8545  --private-key <PRIVATE KEY HERE> --broadcast
```

## Startup

To run the application there is a bash script in the scripts folder. 

it should 
<ul>
    <li>- start the sequencer </li>
   <li> - start anvil to fire every even timetamp </li>
   <li> - deploy the contract </li>
      <li> - Process the random values </li>
    </ul>

I'm using the script deployment using solidity so the contract address is fixed on my machine. I appreciate this would need handling in a real world scenario. Its just easier for testing to use the fixed address that is hard coded. This may need changing on a specific machine config. The contract that is deployed can be taken from the broadcast data in latest-run.json

Again with some of the private key management it's less than ideal and this would be managed much differently in a real world example so please keep and open mind.


## Notes

There is a lot more i would do. Namely

Write more tests

Resetting the nonce if it gets completely out of sync with the server

Refactor.

Finish the other random sequencers. 

Code is not production ready but provides insight into thinking about the problem.