"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async_mutex_1 = require("async-mutex");
const ChainClient_1 = require("./ChainClient");
const TransactionQueue_1 = require("./TransactionQueue");
const Enums_1 = require("./Enums");
const Constants_1 = require("../Constants");
const TransactionManager = (() => {
    // Force singleton to manage nonce access
    let instance = null;
    const createTransactionManager = (initialNonce) => {
        const pendingTransactions = (0, TransactionQueue_1.TransactionQueue)(initialNonce);
        const mutex = new async_mutex_1.Mutex();
        const processTransaction = async (nonce, tx) => {
            const { blockNumber, oracleAddress, abi, functionName, args } = tx;
            try {
                const { request } = await ChainClient_1.HappyChainClient.simulateContract({
                    address: oracleAddress,
                    abi: abi,
                    functionName: functionName,
                    args: args
                });
                const txHash = await ChainClient_1.HappyChainClient.writeContract(request);
                const receipt = await ChainClient_1.HappyChainClient.waitForTransactionReceipt({ hash: txHash });
                if (receipt.status === 'success') {
                    tx.txHash = receipt.transactionHash;
                    tx.status = Enums_1.TransactionStatus.Completed;
                    console.log(`Transaction succeeded at block ${blockNumber} with nonce ${nonce} and txHash ${txHash}`);
                }
                else {
                    tx.status = Enums_1.TransactionStatus.ExecutionFailure;
                    console.error(`Transaction was reverted at block ${blockNumber} with nonce ${nonce} and txHash ${txHash}`);
                }
            }
            catch (e) {
                // Handle gas, nonce, and execution failures - There are a lot of failures that can occur here, i'm just handling a few to show appreciation for some of the possible outcomes.
                if (e.name === 'IntrinsicGasTooLowError') {
                    tx.status = Enums_1.TransactionStatus.GasFailure;
                }
                else if (e.name === 'NonceTooHighError' || e.name === 'NonceTooLowError') {
                    tx.status = Enums_1.TransactionStatus.NonceFailure;
                }
                else {
                    tx.status = Enums_1.TransactionStatus.ExecutionFailure;
                }
            }
        };
        const managePendingTransactionsAsync = async () => {
            const transactionsToRemove = new Map();
            for (const [nonce, tx] of pendingTransactions.getTransactions()) {
                if (tx.status === Enums_1.TransactionStatus.Pending) {
                    tx.status = Enums_1.TransactionStatus.InProgress; // Mark as in-progress
                    console.log(`${tx.args[0]} - Processing pending transaction with nonce ${nonce}`);
                    await processTransaction(nonce, tx);
                }
                else { //Processing failed
                    if (tx.status === Enums_1.TransactionStatus.Completed) {
                        console.log(`${tx.args[0]} - Transaction complete and flagged for removal.`);
                        transactionsToRemove.set(nonce, tx.args[0]); // Mark the nonce for removal
                    }
                    if (tx.status === Enums_1.TransactionStatus.NonceFailure) {
                        tx.retryCount++;
                        // Note - There should be something here to resync the nonce if it gets out of sync with the chain
                        // I would probably pause execution, get the latest nonce from the chain and then reset the nonce through ResetNonce() then continue execution one its been reset
                        if (tx.retryCount > 3) {
                            console.error(`${tx.args[0]} - Transaction failed after 3 retries... removing from the stack randomenss will be 0.`);
                            transactionsToRemove.set(nonce, tx.args[0]); // Mark the transaction for removal
                        }
                        else {
                            //retry the transaction with new nonce
                            await queueTransactionAsync(tx.blockNumber, tx.oracleAddress, Constants_1.DRAND_ORACLE_ABI, 'updateRandomnessForBlock', [tx.args[0], tx.args[1]], tx.retryCount);
                        }
                    }
                    // Retry gas failures
                    if (tx.status === Enums_1.TransactionStatus.GasFailure || tx.status === Enums_1.TransactionStatus.ExecutionFailure) {
                        retry(nonce, tx, transactionsToRemove, "Gas failure");
                    }
                    if (tx.status === Enums_1.TransactionStatus.ExecutionFailure) {
                        retry(nonce, tx, transactionsToRemove, "Execution failure");
                    }
                }
            }
            // Remove completed and failed transactions
            for (const transaction of transactionsToRemove) {
                pendingTransactions.removeTransaction(transaction[0]);
                console.log(`${transaction[1]} with nonce ${transaction[0]} - removed from processor`);
            }
        };
        const retry = (nonce, tx, transactionsToRemove, reason) => {
            tx.retryCount++;
            if (tx.retryCount > 3) {
                console.error(`${tx.args[0]} - Transaction failed after 3 retries... removing from the stack randomenss will be 0.`);
                transactionsToRemove.set(nonce, tx.args[0]); // Mark the transaction for removal
            }
            else {
                console.error(`${tx.args[0]} - Transaction failed due to ${reason}... retrying... attempt ${tx.retryCount}`);
                tx.status = Enums_1.TransactionStatus.Pending;
            }
        };
        const queueTransactionAsync = async (blockNumber, oracleAddress, abi, functionName, args, retryCount = 0) => {
            await mutex.runExclusive(async () => {
                const tx = {
                    blockNumber: blockNumber,
                    txHash: null,
                    oracleAddress: oracleAddress,
                    abi: abi,
                    functionName: functionName,
                    args: args,
                    status: Enums_1.TransactionStatus.Pending,
                    retryCount: retryCount,
                };
                var nonce = pendingTransactions.addTransaction(tx);
                console.log(`${args[0]} - Transaction queued in pending state for block ${blockNumber} with nonce ${nonce}`);
            });
        };
        return {
            queueTransactionAsync,
            managePendingTransactionsAsync
        };
    };
    return {
        getInstance: (nonce, forceInstance = false) => {
            if (!instance || forceInstance) {
                instance = createTransactionManager(nonce);
            }
            return instance;
        }
    };
})();
exports.default = TransactionManager;
