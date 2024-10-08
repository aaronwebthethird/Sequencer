import { Transaction, TransactionStatus } from './TransactionTypes';

// Capactiy added but not implemented, possible to throttle the number of transactions in the queue to maximum capacity of mem pool
// would require further handling to manage anything that's outside of the capacity
const TransactionQueue = ((nonce: number, capacity?: number) => {
    let queue = new Map<number, Transaction>();
    let currentNonce = nonce;

    const addTransaction = (transaction: Transaction): number => {
        var setNonce = currentNonce;
        queue.set(setNonce, transaction);
        currentNonce++;
        return setNonce;
    };

    const getTransaction = (nonce: number): Transaction | undefined => {
        return queue.get(nonce);
    };

    const resetNonce = (verifiedNonce: number): void => {
        const allNonceFailures = Array.from(queue.values())
            .every(transaction => transaction.status === TransactionStatus.NonceFailure);

        if (allNonceFailures) {
            const newQueue = new Map<number, Transaction>();

            for (const transaction of queue.values()) {
                newQueue.set(verifiedNonce, transaction);
                verifiedNonce++;
            }

            queue = newQueue;
            currentNonce = verifiedNonce;
        }
    };

    const hasFailures = (): boolean => {
        return Array.from(queue.values())
            .some(
                transaction => transaction.status === TransactionStatus.GasFailure ||
                    transaction.status === TransactionStatus.NonceFailure ||
                    transaction.status === TransactionStatus.ExecutionFailure);
    }

    const nonceCollapsed = (): boolean => {
        return Array.from(queue.values())
            .every(transaction => transaction.status === TransactionStatus.NonceFailure);
    }

    const getTransactions = (): Map<number, Transaction> => {
        return new Map(Array.from(queue.entries()).sort((a, b) => a[0] - b[0]));

    };

    const removeTransaction = (nonce: number): void => {
        queue.delete(nonce);
    };

    return {
        addTransaction,
        resetNonce,
        nonceCollapsed,
        hasFailures,
        removeTransaction,
        getCurrentNonce: () => currentNonce,
        getTransaction,
        getTransactions: getTransactions,
        length: () => queue.size,

    };
});

export { TransactionQueue };