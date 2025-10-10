"use client";

import { useReadContract, useChainId } from "wagmi";
import { useMemo } from "react";
import { getContractAddress } from "@/config/contracts";
import vDOTAbi from "@/contracts/abis/vDOT.json";
import StakingContractAbi from "@/contracts/abis/StakingContract.json";

/**
 * 格式化大数字显示
 */
function formatNumber(value: bigint, decimals = 18): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = value / divisor;
  const fractionalPart = value % divisor;

  // 转换为数字进行格式化
  const wholeNumber = Number(wholePart);
  const fractionalNumber = Number(fractionalPart) / Number(divisor);
  const totalNumber = wholeNumber + fractionalNumber;

  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(totalNumber);
}

/**
 * 获取链上统计数据
 */
export function useContractStats() {
  const chainId = useChainId();

  // 获取合约地址
  const vDOTAddress = getContractAddress(chainId, "vDOT");
  const stakingContractAddress = getContractAddress(chainId, "StakingContract");

  // 读取 vDOT 总供应量（累计铸造量）
  const {
    data: totalSupply,
    isLoading: isLoadingTotalSupply,
    error: totalSupplyError,
  } = useReadContract({
    address: vDOTAddress,
    abi: vDOTAbi,
    functionName: "totalSupply",
    query: {
      refetchInterval: 10000, // 每10秒刷新一次
    },
  });

  // 读取抵押总量
  const {
    data: totalStaked,
    isLoading: isLoadingTotalStaked,
    error: totalStakedError,
  } = useReadContract({
    address: stakingContractAddress,
    abi: StakingContractAbi,
    functionName: "totalStaked",
    query: {
      refetchInterval: 10000, // 每10秒刷新一次
    },
  });

  // 计算统计数据
  const stats = useMemo(() => {
    const isLoading = isLoadingTotalSupply || isLoadingTotalStaked;
    const hasError = totalSupplyError || totalStakedError;

    // 如果正在加载或出错，返回默认值
    if (isLoading || hasError) {
      return {
        totalMinted: "0",
        totalStaked: "0",
        participantCount: "0",
        isLoading,
        hasError,
        error: totalSupplyError || totalStakedError,
      };
    }

    // 格式化数据
    const formattedTotalMinted = totalSupply
      ? formatNumber(totalSupply as bigint)
      : "0";
    const formattedTotalStaked = totalStaked
      ? formatNumber(totalStaked as bigint)
      : "0";

    // 注意：参与地址数暂时使用估算值
    // 实际实现需要监听 Staked 事件或添加合约计数器
    const estimatedParticipants = totalStaked
      ? Math.max(1, Math.floor(Number(totalStaked) / (10 ** 18 * 100))) // 估算：每100 vDOT一个参与者
      : 0;

    return {
      totalMinted: formattedTotalMinted,
      totalStaked: formattedTotalStaked,
      participantCount: estimatedParticipants.toLocaleString("zh-CN"),
      isLoading: false,
      hasError: false,
      error: null,
    };
  }, [
    totalSupply,
    totalStaked,
    isLoadingTotalSupply,
    isLoadingTotalStaked,
    totalSupplyError,
    totalStakedError,
  ]);

  return stats;
}

/**
 * 获取参与地址数的 Hook（需要监听事件）
 * 这是一个更复杂的实现，需要从链上事件中统计
 */
export function useParticipantCount() {
  const chainId = useChainId();
  const stakingContractAddress = getContractAddress(chainId, "StakingContract");

  // TODO: 实现事件监听来统计参与地址数
  // 这需要：
  // 1. 使用 viem 的 getLogs 读取所有 Staked 事件
  // 2. 提取唯一的用户地址
  // 3. 返回去重后的地址数量

  // 暂时返回估算值
  const { data: totalStaked } = useReadContract({
    address: stakingContractAddress,
    abi: StakingContractAbi,
    functionName: "totalStaked",
  });

  const participantCount = useMemo(() => {
    if (!totalStaked) return 0;

    // 简单估算：假设平均每个参与者抵押 100 vDOT
    const averageStakePerUser = BigInt(100 * 10 ** 18);
    const estimatedCount = Number(totalStaked) / Number(averageStakePerUser);

    return Math.max(1, Math.floor(estimatedCount));
  }, [totalStaked]);

  return {
    participantCount,
    isLoading: false,
  };
}
