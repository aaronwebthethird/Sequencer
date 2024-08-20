import { Abi } from "viem";

export type Transaction = {
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

const TransactionQueue = ((nonce: number, capacity: number) => {
    let queue = new Map<number, Transaction>();
    let currentNonce = nonce;

    const addTransaction = (transaction: Transaction): void => {
        queue.set(currentNonce, transaction);
        currentNonce++;
    };

    const getTransaction = (nonce: number): Transaction | undefined => {
        return queue.get(nonce);
    };

    const resetNonces = (verifiedNonce: number): void => {
        const newQueue = new Map<number, Transaction>();

        for (const transaction of queue.values()) {
            newQueue.set(verifiedNonce, transaction);
            verifiedNonce++;
        }

        queue = newQueue;
        currentNonce = verifiedNonce;
    };

    const hasFailures = (): boolean => {
        return Array.from(queue.values())
            .some(transaction => transaction.status === TransactionStatus.Failed);
    }

    const getItems = (): Map<number, Transaction> => {
        return queue;
    };

    const removeTransaction = (nonce: number): void => {
        queue.delete(nonce);
    };

    return {
        addTransaction,
        resetNonces,
        hasFailures,
        removeTransaction,
        getCurrentNonce: () => currentNonce,
        getTransaction,
        getItems,
    };
});

export { TransactionQueue };