import type { Address } from "viem";

/**
 * 合约地址配置
 * 支持多链部署，根据链 ID 返回对应的合约地址
 */

// 已部署的合约地址（Hardhat Local Network - Chain ID: 31337）
const HARDHAT_CONTRACTS = {
  vDOT: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c" as Address,
  StakingContract: "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1" as Address,
  VotingTicket: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed" as Address,
  VotingContract: "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d" as Address,
  VotingNFTReward: "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE" as Address,
  BTCOracle: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1" as Address,
  OmniLSAdapter: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318" as Address,
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
