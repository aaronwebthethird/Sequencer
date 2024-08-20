import { Mutex } from "async-mutex";
import { HappyChainClient } from "./ChainClient";
import { Abi } from "viem";
import { TransactionQueue } from "./TransactionQueue";
import { Transaction, TransactionStatus } from "./TransactionTypes";
import { DRAND_ORACLE_ABI } from "../Constants";

const TransactionManager = (() => {
    // Force singleton to manage nonce access
    let instance: ReturnType<typeof createTransactionManager> | null = null;

    const createTransactionManager = (initialNonce: number) => {
        const pendingTransactions = TransactionQueue(initialNonce);
        const mutex = new Mutex();

        const processTransaction = async (nonce: number, tx: Transaction): Promise<void> => {
            const { blockNumber, oracleAddress, abi, functionName, args } = tx;
            try {
                const { request } = await HappyChainClient.simulateContract({
                    address: oracleAddress,
                    abi: abi,
                    functionName: functionName,
                    args: args
                })

                const txHash = await HappyChainClient.writeContract(request);
                const receipt = await HappyChainClient.waitForTransactionReceipt({ hash: txHash });

                if (receipt.status === 'success') {
                    tx.txHash = receipt.transactionHash;
                    tx.status = TransactionStatus.Completed;
                    console.log(`Transaction succeeded at block ${blockNumber} with nonce ${nonce} and txHash ${txHash}`);
                } else {
                    tx.status = TransactionStatus.ExecutionFailure;
                    console.error(`Transaction was reverted at block ${blockNumber} with nonce ${nonce} and txHash ${txHash}`);
                }
            } catch (e: any) {
                // Handle gas, nonce, and execution failures - There are a lot of failures that can occur here, i'm just handling a few to show appreciation for some of the possible outcomes.
                if (e.name === 'IntrinsicGasTooLowError') {
                    tx.status = TransactionStatus.GasFailure;
                } else if (e.name === 'NonceTooHighError' || e.name === 'NonceTooLowError') {
                    tx.status = TransactionStatus.NonceFailure;
                } else {
                    tx.status = TransactionStatus.ExecutionFailure;
                }
            }
        };

        const managePendingTransactionsAsync = async (): Promise<void> => {
            const transactionsToRemove: Map<number, bigint> = new Map();

            for (const [nonce, tx] of pendingTransactions.getTransactions()) {
                if (tx.status === TransactionStatus.Pending) {
                    tx.status = TransactionStatus.InProgress; // Mark as in-progress
                    console.log(`${tx.args[0]} - Processing pending transaction with nonce ${nonce}`);
                    await processTransaction(nonce, tx);
                }
                else { //Processing failed
                    if (tx.status === TransactionStatus.Completed) {
                        console.log(`${tx.args[0]} - Transaction complete and flagged for removal.`);
                        transactionsToRemove.set(nonce, tx.args[0]); // Mark the nonce for removal
                    }

                    if (tx.status === TransactionStatus.NonceFailure) {
                        tx.retryCount++;
                        // Note - There should be something here to resync the nonce if it gets out of sync with the chain
                        // I would probably pause execution, get the latest nonce from the chain and then reset the nonce through ResetNonce() then continue execution one its been reset
                        if (tx.retryCount > 3) {
                            console.error(`${tx.args[0]} - Transaction failed after 3 retries... removing from the stack randomenss will be 0.`);
                            transactionsToRemove.set(nonce, tx.args[0]); // Mark the transaction for removal
                        }
                        else {
                            //retry the transaction with new nonce
                            await queueTransactionAsync(
                                tx.blockNumber,
                                tx.oracleAddress,
                                DRAND_ORACLE_ABI,
                                'updateRandomnessForBlock',
                                [tx.args[0], tx.args[1]],
                                tx.retryCount
                            )
                        }
                    }

                    // Retry gas failures
                    if (tx.status === TransactionStatus.GasFailure || tx.status === TransactionStatus.ExecutionFailure) {
                        retry(nonce, tx, transactionsToRemove, "Gas failure");
                    }

                    if (tx.status === TransactionStatus.ExecutionFailure) {
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

        const retry = (nonce: number, tx: Transaction, transactionsToRemove: Map<number, bigint>, reason: string): void => {
            tx.retryCount++;
            if (tx.retryCount > 3) {
                console.error(`${tx.args[0]} - Transaction failed after 3 retries... removing from the stack randomenss will be 0.`);
                transactionsToRemove.set(nonce, tx.args[0]); // Mark the transaction for removal
            } else {
                console.error(`${tx.args[0]} - Transaction failed due to ${reason}... retrying... attempt ${tx.retryCount}`);
                tx.status = TransactionStatus.Pending;
            }
        }

        const queueTransactionAsync = async (
            blockNumber: bigint,
            oracleAddress: `0x${string}`,
            abi: Abi,
            functionName: string,
            args: any[],
            retryCount: number = 0
        ): Promise<void> => {
            await mutex.runExclusive(async () => {
                const tx: Transaction = {
                    blockNumber: blockNumber,
                    txHash: null,
                    oracleAddress: oracleAddress,
                    abi: abi,
                    functionName: functionName,
                    args: args,
                    status: TransactionStatus.Pending,
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
        getInstance: (nonce: number, forceInstance: boolean = false) => {
            if (!instance || forceInstance) {
                instance = createTransactionManager(nonce);
            }
            return instance;
        }
    };
})();

export default TransactionManager;