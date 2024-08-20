import { Mutex } from "async-mutex";
import TransactionManager, { TransactionStatus } from "../src/blockchain/TransactionManager";
import { Abi } from "viem";

jest.mock("../src/blockchain/ChainClient");
jest.mock("../src/blockchain/TransactionQueue");

describe("TransactionManager.queueTransactionAsync", () => {
    let transactionManager: ReturnType<typeof TransactionManager.getInstance>;
    const mockAbi: Abi = [];
    let mutex: Mutex;

    beforeEach(() => {
        transactionManager = TransactionManager.getInstance(0, true);
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should queue a transaction with the correct parameters", async () => {
        const blockNumber = 123n;
        const from = "0xYourWalletAddress";
        const oracleAddress = "0xOracleAddress";
        const functionName = "updateRandomnessForBlock";
        const args = [blockNumber, "0x1234567890abcdef"];

        await transactionManager.queueTransactionAsync(
            blockNumber,
            from,
            oracleAddress,
            mockAbi,
            functionName,
            args
        );

        const pendingTransactions = transactionManager.getTransactions();

        expect(pendingTransactions.length).toBe(1);
        const queuedTransaction = pendingTransactions[0];

        expect(queuedTransaction.nonce).toBe(0);
        expect(queuedTransaction.blockNumber).toBe(blockNumber);
        expect(queuedTransaction.txHash).toBeNull();
        expect(queuedTransaction.timestamp).toBeLessThanOrEqual(Date.now());
        expect(queuedTransaction.oracleAddress).toBe(oracleAddress);
        expect(queuedTransaction.abi).toBe(mockAbi);
        expect(queuedTransaction.functionName).toBe(functionName);
        expect(queuedTransaction.args).toBe(args);
        expect(queuedTransaction.status).toBe(TransactionStatus.Pending);
        expect(queuedTransaction.retryCount).toBe(0);
    });

    it("should increment the nonce for each queued transaction", async () => {
        const blockNumber1 = 123n;
        const blockNumber2 = 124n;

        await transactionManager.queueTransactionAsync(
            blockNumber1,
            "0xYourWalletAddress",
            "0xOracleAddress1",
            mockAbi,
            "functionName1",
            ["arg1"]
        );

        await transactionManager.queueTransactionAsync(
            blockNumber2,
            "0xYourWalletAddress",
            "0xOracleAddress2",
            mockAbi,
            "functionName2",
            ["arg2"]
        );

        const pendingTransactions = transactionManager.getTransactions();

        expect(pendingTransactions.length).toBe(2);

        expect(pendingTransactions[0].nonce).toBe(0);
        expect(pendingTransactions[1].nonce).toBe(1);
    });

    it("should handle multiple transactions queued simultaneously", async () => {
        const blockNumber1 = 123n;
        const blockNumber2 = 124n;
        const blockNumber3 = 125n;

        await Promise.all([
            transactionManager.queueTransactionAsync(
                blockNumber1,
                "0xYourWalletAddress",
                "0xOracleAddress1",
                mockAbi,
                "functionName1",
                ["arg1"]
            ),
            transactionManager.queueTransactionAsync(
                blockNumber2,
                "0xYourWalletAddress",
                "0xOracleAddress2",
                mockAbi,
                "functionName2",
                ["arg2"]
            ),
            transactionManager.queueTransactionAsync(
                blockNumber3,
                "0xYourWalletAddress",
                "0xOracleAddress3",
                mockAbi,
                "functionName3",
                ["arg3"]
            ),
        ]);

        const pendingTransactions = transactionManager.getTransactions();

        expect(pendingTransactions.length).toBe(3);
        expect(pendingTransactions[0].nonce).toBe(0);
        expect(pendingTransactions[1].nonce).toBe(1);
        expect(pendingTransactions[2].nonce).toBe(2);
    });
});