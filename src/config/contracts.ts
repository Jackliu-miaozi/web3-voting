import type { Address } from "viem";

/**
 * 合约地址配置
 * 支持多链部署，根据链 ID 返回对应的合约地址
 */

// 已部署的合约地址（Hardhat Local Network - Chain ID: 31337）
const HARDHAT_CONTRACTS = {
  vDOT: "0x9A676e781A523b5d0C0e43731313A708CB607508" as Address,
  StakingContract: "0x0B306BF915C4d645ff596e518fAf3F9669b97016" as Address,
  VotingTicket: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82" as Address,
  VotingContract: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1" as Address,
  VotingNFTReward: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0" as Address,
  BTCOracle: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e" as Address,
  OmniLSAdapter: "0x0B306BF915C4d645ff596e518fAf3F9669b97016" as Address,
} as const;

// Moonbeam 主网合约地址（待部署）
const MOONBEAM_CONTRACTS = {
  vDOT: "0x0000000000000000000000000000000000000000" as Address,
  StakingContract: "0x0000000000000000000000000000000000000000" as Address,
  VotingTicket: "0x0000000000000000000000000000000000000000" as Address,
  VotingContract: "0x0000000000000000000000000000000000000000" as Address,
  VotingNFTReward: "0x0000000000000000000000000000000000000000" as Address,
  BTCOracle: "0x0000000000000000000000000000000000000000" as Address,
  OmniLSAdapter: "0x0000000000000000000000000000000000000000" as Address,
} as const;

// Moonriver 测试网合约地址（待部署）
const MOONRIVER_CONTRACTS = {
  vDOT: "0x0000000000000000000000000000000000000000" as Address,
  StakingContract: "0x0000000000000000000000000000000000000000" as Address,
  VotingTicket: "0x0000000000000000000000000000000000000000" as Address,
  VotingContract: "0x0000000000000000000000000000000000000000" as Address,
  VotingNFTReward: "0x0000000000000000000000000000000000000000" as Address,
  BTCOracle: "0x0000000000000000000000000000000000000000" as Address,
  OmniLSAdapter: "0x0000000000000000000000000000000000000000" as Address,
} as const;

/**
 * 根据链 ID 获取合约地址
 */
export function getContractAddresses(chainId: number) {
  switch (chainId) {
    case 31337: // Hardhat Local
      return HARDHAT_CONTRACTS;
    case 1284: // Moonbeam
      return MOONBEAM_CONTRACTS;
    case 1285: // Moonriver
      return MOONRIVER_CONTRACTS;
    default:
      console.warn(`Unsupported chain ID: ${chainId}, falling back to Hardhat`);
      return HARDHAT_CONTRACTS;
  }
}

/**
 * 获取特定合约地址
 */
export function getContractAddress(
  chainId: number,
  contractName: keyof typeof HARDHAT_CONTRACTS,
): Address {
  const contracts = getContractAddresses(chainId);
  return contracts[contractName];
}

/**
 * 检查合约是否已部署（地址不为零地址）
 */
export function isContractDeployed(
  chainId: number,
  contractName: keyof typeof HARDHAT_CONTRACTS,
): boolean {
  const address = getContractAddress(chainId, contractName);
  return address !== "0x0000000000000000000000000000000000000000";
}

/**
 * 获取所有已部署的合约信息
 */
export function getDeployedContracts(chainId: number) {
  const contracts = getContractAddresses(chainId);
  const deployed: Record<string, Address> = {};

  Object.entries(contracts).forEach(([name, address]) => {
    if (address !== "0x0000000000000000000000000000000000000000") {
      deployed[name] = address;
    }
  });

  return deployed;
}

// 导出默认配置（当前使用 Hardhat Local）
export const DEFAULT_CONTRACTS = HARDHAT_CONTRACTS;
