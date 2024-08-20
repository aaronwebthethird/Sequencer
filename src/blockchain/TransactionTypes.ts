import { Abi } from "viem";

export type Transaction = {
    blockNumber: bigint;
    txHash: string | null;
    oracleAddress: `0x${string}`;
    abi: Abi;
    functionName: string;
    args: any[];
    status: TransactionStatus;
    retryCount: number;
};

export enum TransactionStatus {
    Pending = 1,
    InProgress = 2,
    Completed = 3,
    GasFailure = 5,
    NonceFailure = 6,
    ExecutionFailure = 7
}