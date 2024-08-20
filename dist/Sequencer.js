"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const drand_client_1 = require("drand-client");
const Constants_1 = require("./Constants");
const ChainClient_1 = require("./blockchain/ChainClient");
const TransactionManager_1 = __importDefault(require("./blockchain/TransactionManager"));
const checkContractExists = async (address) => {
    const code = await ChainClient_1.HappyChainClient.getCode({ address: address });
    console.log(`Code at address ${address}: ${code}`);
    if (code === undefined) {
        return false;
    }
};
const Sequencer = async () => {
    const transactionManager = TransactionManager_1.default.getInstance(0);
    const options = {
        disableBeaconVerification: false,
        noCache: false,
        chainVerificationParams: { chainHash: Constants_1.CHAIN_HASH, publicKey: Constants_1.CHAIN_PUBLIC_KEY }
    };
    const chain = new drand_client_1.HttpCachingChain(Constants_1.CHAIN_URL, options);
    const client = new drand_client_1.HttpChainClient(chain, options);
    const contractAddress = "0x663F3ad617193148711d28f5334eE4Ed07016602";
    // console.log("Starting watcher... ")
    ChainClient_1.HappyChainClient.watchBlocks({
        blockTag: 'latest',
        poll: true,
        pollingInterval: 1000,
        onBlock: async (block) => {
            const nonce = await ChainClient_1.HappyChainClient.getTransactionCount({ address: `0x${Constants_1.WALLET_PUBLIC_KEY}` });
            console.log(`THE CURRENT NONCE IS ${nonce}`);
            const timestampMS = Number(block.timestamp) * 1000;
            const beacon = await (0, drand_client_1.fetchBeaconByTime)(client, new Date(timestampMS).getTime());
            console.log(`Block number - ${block.number} Timestamp - ${block.timestamp} beacon round - ${beacon.round} randomness - ${beacon.randomness}`);
            await transactionManager.queueTransactionAsync(block.number, `0x${Constants_1.WALLET_PUBLIC_KEY}`, contractAddress, Constants_1.DRAND_ORACLE_ABI, 'updateRandomnessForBlock', [block.timestamp, `0x${beacon.randomness}`]);
            // // console.log("Transaction processes this block: ");
            // // console.log(block.transactions);
            // // console.log(`====================================`);
            await transactionManager.managePendingTransactionsAsync();
            // console.log(`END OF PROCESSING BLOCK NUMBER: ${block.number}`);
            // // console.log(`====================================`);\
        }
    });
};
Sequencer();
//forge create --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80  src/blockchain/solidity/DrandOracle.sol:DrandOracle --constructor-args=10
// const now = Date.now();
// const delay = 1000 - (now % 1000);
// const abortController = new AbortController();
// setTimeout(() => {
//     setInterval(async () => {
//         const now = Date.now();
//         const currentTimestamp = Math.floor(now / 1000);
//         const currentDateTime = new Date(currentTimestamp * 1000);
//         if (currentTimestamp % 2 === 0) {
//             const theBeaconRightNow = await fetchBeaconByTime(client, now);
//             console.log(`Triggered at timestamp: ${currentTimestamp}`);
//             console.log(`Current time: ${currentDateTime.toLocaleTimeString()}`);
//             console.log(theBeaconRightNow);
//         }
//         // const theBeaconRightNow = await fetchBeaconByTime(client, now);
//         // console.log(theBeaconRightNow);
//         // Place your code here to execute something every second
//     }, 1000);
// }, delay);
// for await (const beacon of watch(client, abortController)) {
//     const currentTimestamp = Math.floor(Date.now() / 1000);  // Get the current timestamp in seconds
//     const currentDateTime = new Date(currentTimestamp * 1000);  // Convert to a Date object
//     if (currentTimestamp % 2 === 0) {
//         const ron = new Date((currentTimestamp - 2) * 1000);
//         console.log(`prev Time: ${ron.toLocaleTimeString()} ${beacon.randomness}`);
//         console.log(`Local Time: ${currentDateTime.toLocaleTimeString()} ${beacon.randomness}`);
//     } else {
//         // If the timestamp is odd
//         //console.log("Timestamp is odd. Performing odd timestamp action...");
//         //console.log(`Triggered at timestamp: ${currentTimestamp} ${beacon.randomness}`);
//         const oddron = new Date((currentTimestamp - 1) * 1000);
//         console.log(`Local Time: ${oddron.toLocaleTimeString()} ${beacon.randomness}`);
//         // Place your code for odd timestamp here
//     }
// }
