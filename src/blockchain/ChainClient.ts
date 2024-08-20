import { WALLET_PRIVATE_KEY } from "../Constants";
import { createTestClient, http, publicActions, walletActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";

const HappyChainClient = createTestClient({
    chain: foundry,
    mode: "anvil",
    transport: http(),
    account: privateKeyToAccount(`0x${WALLET_PRIVATE_KEY}`),
}).extend(walletActions).extend(publicActions);

export { HappyChainClient };



