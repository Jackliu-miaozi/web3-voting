"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
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
 * 使用公共客户端直接读取合约数据，不依赖钱包连接
 */
export function useContractStats() {
  const [stats, setStats] = useState({
    totalMinted: "0",
    totalStaked: "0",
    participantCount: "0",
    isLoading: true,
    hasError: false,
    error: null as Error | null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        // 创建公共客户端连接到 Hardhat 本地网络
        const client = createPublicClient({
          chain: hardhat,
          transport: http("http://127.0.0.1:8545"),
        });

        // 获取合约地址
        const vDOTAddress = getContractAddress(31337, "vDOT");
        const stakingContractAddress = getContractAddress(
          31337,
          "StakingContract",
        );

        if (!isMounted) return;

        // 并行读取合约数据
        const [totalSupply, totalStaked] = await Promise.all([
          client.readContract({
            address: vDOTAddress,
            abi: vDOTAbi,
            functionName: "totalSupply",
          }),
          client.readContract({
            address: stakingContractAddress,
            abi: StakingContractAbi,
            functionName: "totalStaked",
          }),
        ]);

        if (!isMounted) return;

        // 计算参与地址数量（通过监听 Staked 事件）
        // 注意：这是一个简化的实现，实际应该从事件日志中获取
        const participantCount = (totalStaked as bigint) > 0n ? "1+" : "0";

        setStats({
          totalMinted: formatNumber(totalSupply as bigint),
          totalStaked: formatNumber(totalStaked as bigint),
          participantCount,
          isLoading: false,
          hasError: false,
          error: null,
        });
      } catch (error) {
        if (!isMounted) return;

        console.error("读取合约数据失败:", error);
        setStats({
          totalMinted: "0",
          totalStaked: "0",
          participantCount: "0",
          isLoading: false,
          hasError: true,
          error: error as Error,
        });
      }
    };

    fetchStats().catch(console.error);

    // 设置定时刷新
    const interval = setInterval(() => {
      fetchStats().catch(console.error);
    }, 10000); // 每10秒刷新一次

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return stats;
}
