import { TransactionQueue, Transaction, TransactionStatus } from "../src/blockchain/TransactionQueue"
import { Abi } from "viem";

describe('TransactionQueue', () => {
    let transactionQueue: ReturnType<typeof TransactionQueue>;
    let initialNonce: number = 10;

    beforeEach(() => {
        transactionQueue = TransactionQueue(initialNonce, 0); // Initialize with a nonce of 0 and capacity of 10
    });

    // AddTransactions
    describe('AddTransactions', () => {
        it('should create a transaction queue with the specified nonce and capacity', () => {
            expect(transactionQueue.getItems()).toBeInstanceOf(Map);
            expect(transactionQueue.getItems().size).toBe(0);
            expect(transactionQueue.getCurrentNonce()).toBe(initialNonce);
        });

        it('should add a transaction to the queue with the correct nonce', () => {
            const transaction: Transaction = {
                blockNumber: 123n,
                txHash: null,
                timestamp: Date.now(),
                oracleAddress: '0x1234567890abcdef1234567890abcdef12345678',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'someFunction',
                args: [],
                status: TransactionStatus.Pending,
                retryCount: 0,
            };

            transactionQueue.addTransaction(transaction);

            const queuedTransaction = transactionQueue.getTransaction(initialNonce);
            expect(queuedTransaction).toBeDefined();
            expect(queuedTransaction).toEqual(expect.objectContaining(transaction));
        });

        it('should increment the nonce after adding a transaction', () => {
            const transaction: Transaction = {
                blockNumber: 123n,
                txHash: null,
                timestamp: Date.now(),
                oracleAddress: '0x1234567890abcdef1234567890abcdef12345678',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'someFunction',
                args: [],
                status: TransactionStatus.Pending,
                retryCount: 0,
            };

            transactionQueue.addTransaction(transaction);
            expect(transactionQueue.getCurrentNonce()).toBe(initialNonce + 1);
        });

        it('should add multiple transactions and maintain the correct nonce', () => {
            const transaction1: Transaction = {
                blockNumber: 123n,
                txHash: null,
                timestamp: Date.now(),
                oracleAddress: '0x1234567890abcdef1234567890abcdef12345678',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'someFunction',
                args: [],
                status: TransactionStatus.Pending,
                retryCount: 0,
            };

            const transaction2: Transaction = {
                blockNumber: 124n,
                txHash: null,
                timestamp: Date.now(),
                oracleAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'anotherFunction',
                args: [],
                status: TransactionStatus.Pending,
                retryCount: 0,
            };

            transactionQueue.addTransaction(transaction1);
            transactionQueue.addTransaction(transaction2);

            const queuedTransaction1 = transactionQueue.getTransaction(initialNonce);
            expect(queuedTransaction1?.blockNumber).toBe(transaction1.blockNumber);

            const queuedTransaction2 = transactionQueue.getTransaction(initialNonce + 1);
            expect(queuedTransaction2?.blockNumber).toBe(transaction2.blockNumber);

            expect(transactionQueue.getCurrentNonce()).toBe(initialNonce + 2);
        });

    });

    // ResetNonces
    describe('ResetNonces', () => {
        it('should reset nonces and reorder transactions starting from the verified nonce', () => {
            const transaction1: Transaction = {
                blockNumber: 123n,
                txHash: '0xhash1',
                timestamp: Date.now(),
                oracleAddress: '0x1234567890abcdef1234567890abcdef12345678',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'someFunction',
                args: [],
                status: TransactionStatus.Completed,
                retryCount: 0,
            };

            const transaction2: Transaction = {
                blockNumber: 124n,
                txHash: '0xhash2',
                timestamp: Date.now(),
                oracleAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'anotherFunction',
                args: [],
                status: TransactionStatus.Completed,
                retryCount: 0,
            };

            transactionQueue.addTransaction(transaction1);
            transactionQueue.addTransaction(transaction2);

            expect(transactionQueue.getCurrentNonce()).toBe(12);

            transactionQueue.resetNonces(14);

            const updatedTransaction1 = transactionQueue.getTransaction(14);
            const updatedTransaction2 = transactionQueue.getTransaction(15);

            expect(updatedTransaction1).toBeDefined();
            expect(updatedTransaction2).toBeDefined();

            expect(updatedTransaction1?.blockNumber).toBe(transaction1.blockNumber);
            expect(updatedTransaction2?.blockNumber).toBe(transaction2.blockNumber);
            expect(transactionQueue.getCurrentNonce()).toBe(16);
        });

        it('should handle resetting nonces when the queue is empty', () => {
            // Perform the reset on an empty queue
            transactionQueue.resetNonces(20);

            // The queue should remain empty, and currentNonce should be updated to the verifiedNonce
            expect(transactionQueue.getItems().size).toBe(0);
            expect(transactionQueue.getCurrentNonce()).toBe(20);
        });

        it('should handle resetting nonces when the verifiedNonce is the same as the currentNonce', () => {
            const transaction1: Transaction = {
                blockNumber: 123n,
                txHash: '0xhash1',
                timestamp: Date.now(),
                oracleAddress: '0x1234567890abcdef1234567890abcdef12345678',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'someFunction',
                args: [],
                status: TransactionStatus.Completed,
                retryCount: 0,
            };

            transactionQueue.addTransaction(transaction1);
            transactionQueue.resetNonces(initialNonce);

            const updatedTransaction = transactionQueue.getTransaction(initialNonce);
            expect(updatedTransaction).toBeDefined();

            expect(transactionQueue.getItems().size).toBe(1);
            expect(transactionQueue.getCurrentNonce()).toBe(initialNonce + 1);
        });
    });

    describe('HasFailures', () => {
        it('should return false when there are no transactions in the queue', () => {
            const result = transactionQueue.hasFailures();
            expect(result).toBe(false);
        });

        it('should return false when there are no failed transactions in the queue', () => {
            // Setup initial transactions with no failures
            const transaction1: Transaction = {
                blockNumber: 123n,
                txHash: '0xhash1',
                timestamp: Date.now(),
                oracleAddress: '0x1234567890abcdef1234567890abcdef12345678',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'someFunction',
                args: [],
                status: TransactionStatus.Completed,
                retryCount: 0,
            };

            const transaction2: Transaction = {
                blockNumber: 124n,
                txHash: '0xhash2',
                timestamp: Date.now(),
                oracleAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'anotherFunction',
                args: [],
                status: TransactionStatus.Pending,
                retryCount: 0,
            };

            transactionQueue.addTransaction(transaction1);
            transactionQueue.addTransaction(transaction2);

            const result = transactionQueue.hasFailures();
            expect(result).toBe(false); // No failures in the queue
        });

        it('should return true when there is at least one failed transaction in the queue', () => {
            // Setup initial transactions with one failure
            const transaction1: Transaction = {
                blockNumber: 123n,
                txHash: '0xhash1',
                timestamp: Date.now(),
                oracleAddress: '0x1234567890abcdef1234567890abcdef12345678',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'someFunction',
                args: [],
                status: TransactionStatus.Completed,
                retryCount: 0,
            };

            const transaction2: Transaction = {
                blockNumber: 124n,
                txHash: '0xhash2',
                timestamp: Date.now(),
                oracleAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'anotherFunction',
                args: [],
                status: TransactionStatus.Failed, // Mark this transaction as failed
                retryCount: 1,
            };

            transactionQueue.addTransaction(transaction1);
            transactionQueue.addTransaction(transaction2);

            const result = transactionQueue.hasFailures();
            expect(result).toBe(true); // There is a failure in the queue
        });

        it('should return true when all transactions in the queue have failed', () => {
            // Setup initial transactions with all failures
            const transaction1: Transaction = {
                blockNumber: 123n,
                txHash: '0xhash1',
                timestamp: Date.now(),
                oracleAddress: '0x1234567890abcdef1234567890abcdef12345678',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'someFunction',
                args: [],
                status: TransactionStatus.Failed, // Mark this transaction as failed
                retryCount: 1,
            };

            const transaction2: Transaction = {
                blockNumber: 124n,
                txHash: '0xhash2',
                timestamp: Date.now(),
                oracleAddress: '0x1234567890abcdef1234567890abcdef12345678',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'anotherFunction',
                args: [],
                status: TransactionStatus.Failed, // Mark this transaction as failed
                retryCount: 1,
            };

            transactionQueue.addTransaction(transaction1);
            transactionQueue.addTransaction(transaction2);

            const result = transactionQueue.hasFailures();
            expect(result).toBe(true); // All transactions have failed
        });
    });
    describe('HasFailures', () => {
        it('should remove a transaction from the queue by nonce', () => {
            // Setup initial transactions
            const transaction1: Transaction = {
                blockNumber: 123n,
                txHash: '0xhash1',
                timestamp: Date.now(),
                oracleAddress: '0x1234567890abcdef1234567890abcdef12345678',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'someFunction',
                args: [],
                status: TransactionStatus.Completed,
                retryCount: 0,
            };

            const transaction2: Transaction = {
                blockNumber: 124n,
                txHash: '0xhash2',
                timestamp: Date.now(),
                oracleAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'anotherFunction',
                args: [],
                status: TransactionStatus.Completed,
                retryCount: 0,
            };

            transactionQueue.addTransaction(transaction1);
            transactionQueue.addTransaction(transaction2);

            // Confirm both transactions are in the queue
            expect(transactionQueue.getItems().size).toBe(2);

            // Remove the first transaction
            transactionQueue.removeTransaction(initialNonce);

            // Check that the first transaction was removed
            expect(transactionQueue.getTransaction(initialNonce)).toBeUndefined();
            expect(transactionQueue.getItems().size).toBe(1); // Only one transaction should remain

            // Check that the remaining transaction is correct
            expect(transactionQueue.getTransaction(initialNonce + 1)).toEqual(transaction2);
        });

        it('should not throw an error if trying to remove a transaction that does not exist', () => {
            // Setup initial transaction
            const transaction: Transaction = {
                blockNumber: 123n,
                txHash: '0xhash1',
                timestamp: Date.now(),
                oracleAddress: '0x1234567890abcdef1234567890abcdef12345678',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'someFunction',
                args: [],
                status: TransactionStatus.Completed,
                retryCount: 0,
            };

            transactionQueue.addTransaction(transaction);

            // Confirm the transaction is in the queue
            expect(transactionQueue.getItems().size).toBe(1);

            // Attempt to remove a transaction with a nonexistent nonce
            expect(() => transactionQueue.removeTransaction(99)).not.toThrow();

            // Ensure the original transaction is still there
            expect(transactionQueue.getItems().size).toBe(1);
            expect(transactionQueue.getTransaction(initialNonce)).toEqual(transaction);
        });

        it('should not remove any other transactions when removing a specific nonce', () => {
            // Setup initial transactions
            const transaction1: Transaction = {
                blockNumber: 123n,
                txHash: '0xhash1',
                timestamp: Date.now(),
                oracleAddress: '0x1234567890abcdef1234567890abcdef12345678',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'someFunction',
                args: [],
                status: TransactionStatus.Completed,
                retryCount: 0,
            };

            const transaction2: Transaction = {
                blockNumber: 124n,
                txHash: '0xhash2',
                timestamp: Date.now(),
                oracleAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
                abi: [] as Abi, // Assume some ABI here
                functionName: 'anotherFunction',
                args: [],
                status: TransactionStatus.Completed,
                retryCount: 0,
            };

            transactionQueue.addTransaction(transaction1);
            transactionQueue.addTransaction(transaction2);

            // Confirm both transactions are in the queue
            expect(transactionQueue.getItems().size).toBe(2);

            // Remove the second transaction
            transactionQueue.removeTransaction(initialNonce + 1);

            // Ensure the first transaction is still there
            expect(transactionQueue.getItems().size).toBe(1);
            expect(transactionQueue.getTransaction(initialNonce)).toEqual(transaction1);

            // Ensure the second transaction was removed
            expect(transactionQueue.getTransaction(initialNonce + 1)).toBeUndefined();
        });
    });
});