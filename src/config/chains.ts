import { defineChain } from "viem";

/**
 * Moonbeam Network Configuration
 * Moonbeam is an EVM-compatible smart contract platform on Polkadot
 */
export const moonbeam = defineChain({
  id: 1284,
  name: "Moonbeam",
  network: "moonbeam",
  nativeCurrency: {
    decimals: 18,
    name: "GLMR",
    symbol: "GLMR",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_MOONBEAM_RPC_URL ??
          "https://rpc.api.moonbeam.network",
      ],
      webSocket: ["wss://wss.api.moonbeam.network"],
    },
    public: {
      http: ["https://rpc.api.moonbeam.network"],
      webSocket: ["wss://wss.api.moonbeam.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Moonscan",
      url: "https://moonscan.io",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 609002,
    },
  },
  testnet: false,
});

/**
 * Moonriver Network Configuration (Kusama parachain)
 */
export const moonriver = defineChain({
  id: 1285,
  name: "Moonriver",
  network: "moonriver",
  nativeCurrency: {
    decimals: 18,
    name: "MOVR",
    symbol: "MOVR",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_MOONRIVER_RPC_URL ??
          "https://rpc.api.moonriver.moonbeam.network",
      ],
      webSocket: ["wss://wss.api.moonriver.moonbeam.network"],
    },
    public: {
      http: ["https://rpc.api.moonriver.moonbeam.network"],
      webSocket: ["wss://wss.api.moonriver.moonbeam.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Moonscan",
      url: "https://moonriver.moonscan.io",
    },
  },
  testnet: false,
});

/**
 * Hardhat Local Network Configuration
 * For local development and testing
 */
export const hardhat = defineChain({
  id: 31337,
  name: "Hardhat Local",
  network: "hardhat",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
    public: {
      http: ["http://127.0.0.1:8545"],
    },
  },
  testnet: true,
});

/**
 * Supported chains for the application
 */
export const supportedChains = [moonbeam, moonriver, hardhat] as const;
