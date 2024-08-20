import { fetchBeaconByTime, HttpCachingChain, HttpChainClient } from "drand-client";
import { CHAIN_HASH, CHAIN_URL, CHAIN_PUBLIC_KEY, WALLET_PUBLIC_KEY, DRAND_ORACLE_ABI } from "./Constants";
import { HappyChainClient } from "./blockchain/ChainClient";
import TransactionManager from "./blockchain/TransactionManager";

const Sequencer = async () => {
    const nonce = await HappyChainClient.getTransactionCount({ address: `0x${WALLET_PUBLIC_KEY}` })
    const transactionManager = TransactionManager.getInstance(nonce);
    const options = {
        disableBeaconVerification: false,
        noCache: false,
        chainVerificationParams: { chainHash: CHAIN_HASH, publicKey: CHAIN_PUBLIC_KEY }
    }

    const chain = new HttpCachingChain(CHAIN_URL, options)
    const client = new HttpChainClient(chain, options)
    const contractAddress = "0x663F3ad617193148711d28f5334eE4Ed07016602";

    console.log("Starting watcher... ")

    HappyChainClient.watchBlocks(
        {
            blockTag: 'latest',
            poll: true,
            pollingInterval: 1000,
            onBlock: async block => {
                const timestampMS = Number(block.timestamp) * 1000;
                const beacon = await fetchBeaconByTime(client, new Date(timestampMS).getTime());
                console.log(`Block number - ${block.number} Timestamp - ${block.timestamp} beacon round - ${beacon.round} randomness - ${beacon.randomness}`);
                await transactionManager.queueTransactionAsync(
                    block.number,
                    `0x${WALLET_PUBLIC_KEY}`,
                    contractAddress,
                    DRAND_ORACLE_ABI,
                    'updateRandomnessForBlock',
                    [block.timestamp, `0x${beacon.randomness}`]);
                await transactionManager.managePendingTransactionsAsync();
            }
        }
    );
};

Sequencer();

//forge create --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80  src/blockchain/solidity/DrandOracle.sol:DrandOracle --constructor-args=10
