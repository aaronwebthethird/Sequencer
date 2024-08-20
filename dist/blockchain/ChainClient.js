"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HappyChainClient = void 0;
const Constants_1 = require("../Constants");
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const chains_1 = require("viem/chains");
const HappyChainClient = (0, viem_1.createTestClient)({
    chain: chains_1.foundry,
    mode: "anvil",
    transport: (0, viem_1.http)(),
    account: (0, accounts_1.privateKeyToAccount)(`0x${Constants_1.WALLET_PRIVATE_KEY}`),
}).extend(viem_1.walletActions).extend(viem_1.publicActions);
exports.HappyChainClient = HappyChainClient;
