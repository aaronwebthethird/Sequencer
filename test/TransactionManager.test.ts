import { Abi } from "viem";
import TransactionManager from '../src/blockchain/TransactionManager';
import { TransactionQueue } from '../src/blockchain/TransactionQueue';
import { HappyChainClient } from "../src/blockchain/ChainClient";
import { Transaction, TransactionStatus } from "../src/blockchain/TransactionTypes";


// Mock the TransactionQueue module
jest.mock('../src/blockchain/TransactionQueue', () => {
    return {
        TransactionQueue: jest.fn().mockImplementation((nonce: number) => {
            return {
                addTransaction: jest.fn(),
                resetNonce: jest.fn(),
                nonceCollapsed: jest.fn(),
                hasFailures: jest.fn(),
                removeTransaction: jest.fn(),
                getCurrentNonce: jest.fn().mockReturnValue(nonce),
                getTransaction: jest.fn(),
                getTransactions: jest.fn().mockReturnValue(new Map()),
                length: jest.fn().mockReturnValue(0),
            };
        })
    };
});

jest.mock('../src/blockchain/ChainClient', () => ({
    HappyChainClient: {
        simulateContract: jest.fn(),
        writeContract: jest.fn(),
        waitForTransactionReceipt: jest.fn(),
        getTransactionCount: jest.fn(),
    },
}));


describe('TransactionManager', () => {
    let transactionManager: ReturnType<typeof TransactionManager.getInstance>;
    const mockAbi: Abi = [];

    beforeEach(() => {
        // Reset the mock before each test
        jest.clearAllMocks();
        transactionManager = TransactionManager.getInstance(0, true);
    });

    describe('queueTransactionAsync', () => {
        it('should queue a transaction with the correct parameters', async () => {
            const blockNumber = 123n;
            const oracleAddress = '0xOracleAddress';
            const functionName = 'updateRandomnessForBlock';
            const args = [blockNumber, '0x1234567890abcdef'];

            await transactionManager.queueTransactionAsync(
                blockNumber,
                oracleAddress,
                mockAbi,
                functionName,
                args
            );

            const mockQueue = (TransactionQueue as jest.Mock).mock.results[0].value;

            expect(mockQueue.addTransaction).toHaveBeenCalledTimes(1);
            expect(mockQueue.addTransaction).toHaveBeenCalledWith(
                expect.objectContaining({
                    blockNumber,
                    oracleAddress,
                    abi: mockAbi,
                    functionName,
                    args,
                    status: 1,
                    retryCount: 0
                }));

        });

        it('should queue a transaction with the correct parameters', async () => {
            const blockNumber = 123n;
            const oracleAddress = '0xOracleAddress';
            const functionName = 'updateRandomnessForBlock';
            const args = [blockNumber, '0x1234567890abcdef'];

            await transactionManager.queueTransactionAsync(
                blockNumber,
                oracleAddress,
                mockAbi,
                functionName,
                args
            );

            const mockQueue = (TransactionQueue as jest.Mock).mock.results[0].value;

            expect(mockQueue.addTransaction).toHaveBeenCalledTimes(1);
        });
    });

    describe('TransactionManager.managePendingTransactionsAsync', () => {
        let transactionManager: ReturnType<typeof TransactionManager.getInstance>;
        const mockAbi: Abi = [];
        const pendingTransaction: Transaction = {
            blockNumber: 1n,
            txHash: null,
            oracleAddress: '0xOracleAddress',
            abi: mockAbi,
            functionName: 'updateRandomnessForBlock',
            args: [7654n, '0x1234567890abcdef'],
            status: TransactionStatus.Pending,
            retryCount: 0,
        };
        const nonce = 0;

        beforeEach(() => {
            jest.clearAllMocks();
            transactionManager = TransactionManager.getInstance(0, true);
        });

        it('should process pending transactions and mark them as in-progress', async () => {
            const mockQueue = (TransactionQueue as jest.Mock).mock.results[0].value;
            const pendingTransactions = new Map<number, Transaction>();

            pendingTransactions.set(nonce, pendingTransaction);

            mockQueue.getTransactions.mockReturnValue(pendingTransactions);

            await transactionManager.managePendingTransactionsAsync();

            expect(mockQueue.getTransactions).toHaveBeenCalled();

        });

        it('should handle completed transactions and remove them from the queue', async () => {
            const mockQueue = (TransactionQueue as jest.Mock).mock.results[0].value;
            const pendingTransactions = new Map<number, any>([
                [0, { status: TransactionStatus.Completed, args: [123n] }],
            ]);
            mockQueue.getTransactions.mockReturnValue(pendingTransactions);

            await transactionManager.managePendingTransactionsAsync();

            expect(mockQueue.removeTransaction).toHaveBeenCalledWith(0);
        });

    });
});