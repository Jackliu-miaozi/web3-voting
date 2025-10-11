import type { Address } from "viem";

/**
 * 合约地址配置
 * 支持多链部署，根据链 ID 返回对应的合约地址
 */

// 已部署的合约地址（Hardhat Local Network - Chain ID: 31337）
const HARDHAT_CONTRACTS = {
  vDOT: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" as Address,
  StakingContract: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" as Address,
  VotingTicket: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" as Address,
  VotingContract: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707" as Address,
  VotingNFTReward: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as Address,
  BTCOracle: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address,
  OmniLSAdapter: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" as Address,
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
