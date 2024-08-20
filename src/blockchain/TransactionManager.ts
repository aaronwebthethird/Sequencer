import { Mutex } from "async-mutex";
import { HappyChainClient } from "./ChainClient";
import { Abi } from "viem";

export type Transaction = {
    nonce: number;
    blockNumber: bigint;
    txHash: string | null;
    timestamp: number;
    oracleAddress: `0x${string}`;
    abi: Abi;
    functionName: string;
    args: any[];
    status: TransactionStatus;
    retryCount: number;
};

export enum TransactionStatus {
    None = 0,          // No flags set
    Pending = 1 << 0,  // 0001
    InProgress = 1 << 1, // 0010
    Completed = 1 << 2,  // 0100
    Failed = 1 << 3,    // 1000
}

const TransactionManager = (() => {
    // Force singleton to manage nonce access
    let instance: ReturnType<typeof createTransactionManager> | null = null;

    const createTransactionManager = (nonce: number) => {
        const pendingTransactions = new Array<Transaction>();
        const mutex = new Mutex();
        let trackedNonce: number = nonce;

        const processTransaction = async (tx: Transaction): Promise<void> => {
            const { blockNumber, oracleAddress, abi, functionName, args } = tx;
            try {
                const txHash = await HappyChainClient.writeContract({
                    address: oracleAddress,
                    abi: abi,
                    functionName: functionName,
                    args: args,
                    nonce: tx.nonce
                });

                const receipt = await HappyChainClient.waitForTransactionReceipt({ hash: txHash });

                if (receipt.status === 'success') {
                    tx.txHash = receipt.transactionHash;
                    tx.status = TransactionStatus.Completed;
                    console.log(`Transaction succeeded at block ${blockNumber} with nonce ${tx.nonce} and txHash ${txHash}`);
                } else {
                    tx.status = TransactionStatus.Failed;
                    console.error(`Transaction failed at block ${blockNumber} with nonce ${tx.nonce} and txHash ${txHash}`);
                }
            } catch (error) {
                tx.status = TransactionStatus.Failed;
                // Here we can do retry logic to adjust the nonce if it's out of sync
            }
        };

        const managePendingTransactionsAsync = async (): Promise<void> => {
            const transactionsToRemove: number[] = [];

            for (let i = 0; i < pendingTransactions.length; i++) {
                const tx = pendingTransactions[i];
                if (tx.status === TransactionStatus.Completed) {
                    console.log(`Transaction ${tx.txHash} complete and flagged for removal.`);
                    transactionsToRemove.push(i); // Mark the index for removal
                } else if (tx.status !== TransactionStatus.InProgress) {
                    if (tx.status === TransactionStatus.Failed) {
                        tx.retryCount = tx.retryCount + 1;
                    }
                    if (tx.retryCount > 3) {
                        console.error(`Transaction ${tx.txHash} failed after 3 retries and flagged for removal.`);
                        transactionsToRemove.push(i); // Mark the index for removal
                    }
                    else {

                        tx.status = TransactionStatus.InProgress; // Mark as in-progress
                        await processTransaction(tx);
                    }
                }
            }

            // Remove completed transactions
            for (let i = transactionsToRemove.length - 1; i >= 0; i--) {
                pendingTransactions.splice(transactionsToRemove[i], 1);
            }
        };

        const queueTransactionAsync = async (
            blockNumber: bigint,
            from: string,
            oracleAddress: `0x${string}`,
            abi: Abi,
            functionName: string,
            args: any[]
        ): Promise<void> => {
            await mutex.runExclusive(async () => {
                const tx: Transaction = {
                    nonce: trackedNonce,
                    blockNumber: blockNumber,
                    txHash: null,
                    timestamp: Date.now(),
                    oracleAddress: oracleAddress,
                    abi: abi,
                    functionName: functionName,
                    args: args,
                    status: TransactionStatus.Pending,
                    retryCount: 0,
                };

                pendingTransactions.push(tx);
                trackedNonce = trackedNonce + 1;
                console.log(`Transaction queued in pending state for ${blockNumber} with nonce ${tx.nonce}`);
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