"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async_mutex_1 = require("async-mutex");
const ChainClient_1 = require("./ChainClient");
const TransactionManager = (() => {
    // Force singleton to manage nonce access
    let instance = null;
    const createTransactionManager = (nonce) => {
        const pendingTransactions = new Array();
        const mutex = new async_mutex_1.Mutex();
        let trackedNonce = nonce;
        // const incrementNonce = (): number => {
        //     trackedNonce = trackedNonce + 1;
        //     return trackedNonce;
        // }
        const processTransaction = async (tx) => {
            const { blockNumber, oracleAddress, abi, functionName, args } = tx;
            try {
                const txHash = await ChainClient_1.HappyChainClient.writeContract({
                    address: oracleAddress,
                    abi: abi,
                    functionName: functionName,
                    args: args,
                    nonce: 0
                });
                console.log(`Transaction sent for block ${blockNumber} with nonce ${tx.nonce}`);
                const receipt = await ChainClient_1.HappyChainClient.waitForTransactionReceipt({ hash: txHash });
                console.log(`Transaction processed for block ${blockNumber} with txHash ${txHash} and status ${receipt.status}`);
                tx.txHash = receipt.transactionHash;
                console.log(`AT LEAST ONE WORKED`);
            }
            catch (error) {
                console.error(`Error processing transaction at block ${blockNumber}:`, error);
                throw error;
            }
        };
        const managePendingTransactionsAsync = async () => {
            const transactionsToRemove = [];
            for (let i = 0; i < pendingTransactions.length; i++) {
                const tx = pendingTransactions[i];
                if (!tx.txHash) {
                    await processTransaction(tx);
                    if (tx.txHash) {
                        transactionsToRemove.push(tx);
                    }
                }
            }
            // Remove transactions after iteration
            for (const tx of transactionsToRemove) {
                const index = pendingTransactions.indexOf(tx);
                if (index > -1) {
                    pendingTransactions.splice(index, 1);
                }
            }
        };
        const queueTransactionAsync = async (blockNumber, from, oracleAddress, abi, functionName, args) => {
            await mutex.runExclusive(async () => {
                const tx = {
                    nonce: trackedNonce,
                    blockNumber: blockNumber,
                    txHash: null,
                    timestamp: Date.now(),
                    oracleAddress: oracleAddress,
                    abi: abi,
                    functionName: functionName,
                    args: args,
                };
                if (pendingTransactions.length == 0) {
                    pendingTransactions.push(tx);
                }
            });
        };
        return {
            queueTransactionAsync,
            managePendingTransactionsAsync,
        };
    };
    return {
        getInstance: (nonce) => {
            if (!instance) {
                instance = createTransactionManager(nonce);
            }
            return instance;
        }
    };
})();
exports.default = TransactionManager;
