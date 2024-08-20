"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionQueue = void 0;
const Enums_1 = require("./Enums");
// Capactiy added but not implemented, possible to throttle the number of transactions in the queue to maximum capacity of mem pool
// would require further handling to manage anything that's outside of the capacity
const TransactionQueue = ((nonce, capacity) => {
    let queue = new Map();
    let currentNonce = nonce;
    const addTransaction = (transaction) => {
        var setNonce = currentNonce;
        queue.set(setNonce, transaction);
        currentNonce++;
        return setNonce;
    };
    const getTransaction = (nonce) => {
        return queue.get(nonce);
    };
    const resetNonce = (verifiedNonce) => {
        const allNonceFailures = Array.from(queue.values())
            .every(transaction => transaction.status === Enums_1.TransactionStatus.NonceFailure);
        if (allNonceFailures) {
            const newQueue = new Map();
            for (const transaction of queue.values()) {
                newQueue.set(verifiedNonce, transaction);
                verifiedNonce++;
            }
            queue = newQueue;
            currentNonce = verifiedNonce;
        }
    };
    const hasFailures = () => {
        return Array.from(queue.values())
            .some(transaction => transaction.status === Enums_1.TransactionStatus.GasFailure ||
            transaction.status === Enums_1.TransactionStatus.NonceFailure ||
            transaction.status === Enums_1.TransactionStatus.ExecutionFailure);
    };
    const nonceCollapsed = () => {
        return Array.from(queue.values())
            .every(transaction => transaction.status === Enums_1.TransactionStatus.NonceFailure);
    };
    const getTransactions = () => {
        return new Map(Array.from(queue.entries()).sort((a, b) => a[0] - b[0]));
    };
    const removeTransaction = (nonce) => {
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
exports.TransactionQueue = TransactionQueue;
