import dotenv from "dotenv";
import { Abi } from "viem"
dotenv.config();

export const CHAIN_HASH: string = process.env.CHAIN_HASH || "";
export const CHAIN_PUBLIC_KEY: string = process.env.CHAIN_PUBLIC_KEY || "";
export const CHAIN_URL: string = process.env.CHAIN_URL || "";
export const WALLET_PRIVATE_KEY: string = process.env.WALLET_PRIVATE_KEY || "";
export const WALLET_PUBLIC_KEY: string = process.env.WALLET_PUBLIC_KEY || "";
export const MAX_DRAND_TIMEOUT: number = Number(process.env.MAX_DRAND_TIMEOUT) || 10;
export const CONTRACT_ADDRESS: string = process.env.CONTRACT_ADDRESS || "";

export const DRAND_ORACLE_ABI: Abi = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "timeout",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "randomness",
                "type": "bytes32"
            }
        ],
        "name": "RandomnessUpdated",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "drandTimeout",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "getRandomnessForBlock",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "isRandomnessAvailable",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "randomness",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "unsafeGetRandomnessForBlock",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "bytes32",
                "name": "newRandomness",
                "type": "bytes32"
            }
        ],
        "name": "updateRandomnessForBlock",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
