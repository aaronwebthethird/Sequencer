"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const drand_client_1 = require("drand-client");
const Constants_1 = require("./Constants");
const ChainClient_1 = require("./blockchain/ChainClient");
const TransactionManager_1 = __importDefault(require("./blockchain/TransactionManager"));
const Sequencer = async () => {
    const nonce = await ChainClient_1.HappyChainClient.getTransactionCount({ address: `0x${Constants_1.WALLET_PUBLIC_KEY}` });
    const transactionManager = TransactionManager_1.default.getInstance(nonce);
    console.log(`Starting sequencer with nonce ${nonce}\n\n`);
    const options = {
        disableBeaconVerification: false,
        noCache: false,
        chainVerificationParams: { chainHash: Constants_1.CHAIN_HASH, publicKey: Constants_1.CHAIN_PUBLIC_KEY }
    };
    const chain = new drand_client_1.HttpCachingChain(Constants_1.CHAIN_URL, options);
    const client = new drand_client_1.HttpChainClient(chain, options);
    const contractAddress = "0x663F3ad617193148711d28f5334eE4Ed07016602";
    console.log("Starting watcher... ");
    ChainClient_1.HappyChainClient.watchBlocks({
        blockTag: 'latest',
        poll: true,
        pollingInterval: 1000,
        onBlock: async (block) => {
            const timestampMS = Number(block.timestamp) * 1000;
            const beacon = await (0, drand_client_1.fetchBeaconByTime)(client, new Date(timestampMS).getTime());
            console.log(`${block.timestamp} - Block number - ${block.number} beacon round - ${beacon.round} randomness - ${beacon.randomness}`);
            await transactionManager.queueTransactionAsync(block.number, contractAddress, Constants_1.DRAND_ORACLE_ABI, 'updateRandomnessForBlock', [block.timestamp, `0x${beacon.randomness}`]);
            await transactionManager.managePendingTransactionsAsync();
        }
    });
};
Sequencer();
//forge create --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80  src/blockchain/solidity/DrandOracle.sol:DrandOracle --constructor-args=10
