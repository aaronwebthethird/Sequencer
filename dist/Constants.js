"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DRAND_ORACLE_ABI = exports.CONTRACT_ADDRESS = exports.MAX_DRAND_TIMEOUT = exports.WALLET_PUBLIC_KEY = exports.WALLET_PRIVATE_KEY = exports.CHAIN_URL = exports.CHAIN_PUBLIC_KEY = exports.CHAIN_HASH = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.CHAIN_HASH = process.env.CHAIN_HASH || "";
exports.CHAIN_PUBLIC_KEY = process.env.CHAIN_PUBLIC_KEY || "";
exports.CHAIN_URL = process.env.CHAIN_URL || "";
exports.WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
exports.WALLET_PUBLIC_KEY = process.env.WALLET_PUBLIC_KEY || "";
exports.MAX_DRAND_TIMEOUT = Number(process.env.MAX_DRAND_TIMEOUT) || 10;
exports.CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
exports.DRAND_ORACLE_ABI = [
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
