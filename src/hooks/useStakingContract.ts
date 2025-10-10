"use client";

import {
  useReadContract,
  useWriteContract,
  useAccount,
  useChainId,
} from "wagmi";
import { useMemo } from "react";
import { getContractAddress } from "@/config/contracts";
import StakingContractAbi from "@/contracts/abis/StakingContract.json";
import vDOTAbi from "@/contracts/abis/vDOT.json";

/**
 * 用户抵押信息
 */
export interface StakeInfo {
  amount: bigint;
  lockDuration: bigint;
  startTime: bigint;
  endTime: bigint;
  ticketsMinted: bigint;
  active: boolean;
}

/**
 * 锁定选项信息
 */
export interface LockOption {
  duration: bigint;
  multiplier: bigint;
  active: boolean;
}

/**
 * 抵押合约交互 Hook
 */
export function useStakingContract() {
  const chainId = useChainId();
  const { address } = useAccount();

  const stakingContractAddress = getContractAddress(chainId, "StakingContract");
  const vDOTAddress = getContractAddress(chainId, "vDOT");

  // 写入合约方法
  const { writeContract, isPending, error: writeError } = useWriteContract();

  // 读取用户 vDOT 余额
  const { data: vDOTBalance } = useReadContract({
    address: vDOTAddress,
    abi: vDOTAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // 读取用户对抵押合约的授权额度
  const { data: allowance } = useReadContract({
    address: vDOTAddress,
    abi: vDOTAbi,
    functionName: "allowance",
    args:
      address && stakingContractAddress
        ? [address, stakingContractAddress]
        : undefined,
  });

  // 读取用户抵押记录数量
  const { data: stakeCount } = useReadContract({
    address: stakingContractAddress,
    abi: StakingContractAbi,
    functionName: "getUserStakeCount",
    args: address ? [address] : undefined,
  });

  // 读取总抵押量
  const { data: totalStaked } = useReadContract({
    address: stakingContractAddress,
    abi: StakingContractAbi,
    functionName: "totalStaked",
  });

  // 读取锁定选项
  const { data: lockOption7 } = useReadContract({
    address: stakingContractAddress,
    abi: StakingContractAbi,
    functionName: "lockOptions",
    args: [BigInt(7)],
  });

  const { data: lockOption30 } = useReadContract({
    address: stakingContractAddress,
    abi: StakingContractAbi,
    functionName: "lockOptions",
    args: [BigInt(30)],
  });

  const { data: lockOption90 } = useReadContract({
    address: stakingContractAddress,
    abi: StakingContractAbi,
    functionName: "lockOptions",
    args: [BigInt(90)],
  });

  // 计算可用的锁定选项
  const lockOptions = useMemo(() => {
    const options = [];

    if (lockOption7) {
      const [duration, multiplier, active] = lockOption7 as [
        bigint,
        bigint,
        boolean,
      ];
      if (active) {
        options.push({
          duration: Number(duration) / (24 * 60 * 60), // 转换为天数
          multiplier: Number(multiplier) / 10000, // 转换为倍数
          days: 7,
        });
      }
    }

    if (lockOption30) {
      const [duration, multiplier, active] = lockOption30 as [
        bigint,
        bigint,
        boolean,
      ];
      if (active) {
        options.push({
          duration: Number(duration) / (24 * 60 * 60),
          multiplier: Number(multiplier) / 10000,
          days: 30,
        });
      }
    }

    if (lockOption90) {
      const [duration, multiplier, active] = lockOption90 as [
        bigint,
        bigint,
        boolean,
      ];
      if (active) {
        options.push({
          duration: Number(duration) / (24 * 60 * 60),
          multiplier: Number(multiplier) / 10000,
          days: 90,
        });
      }
    }

    return options.sort((a, b) => a.days - b.days);
  }, [lockOption7, lockOption30, lockOption90]);

  // 抵押方法
  const stake = async (amount: bigint, lockDuration: number) => {
    if (!address) {
      throw new Error("请先连接钱包");
    }

    try {
      // 首先检查授权额度
      if (!allowance || (allowance as bigint) < amount) {
        // 需要先授权
        writeContract({
          address: vDOTAddress,
          abi: vDOTAbi,
          functionName: "approve",
          args: [stakingContractAddress, amount],
        });
      }

      // 执行抵押
      writeContract({
        address: stakingContractAddress,
        abi: StakingContractAbi,
        functionName: "stake",
        args: [amount, BigInt(lockDuration)],
      });
    } catch (error) {
      console.error("抵押失败:", error);
      throw error;
    }
  };

  // 解除抵押方法
  const unstake = async (stakeIndex: number) => {
    if (!address) {
      throw new Error("请先连接钱包");
    }

    try {
      writeContract({
        address: stakingContractAddress,
        abi: StakingContractAbi,
        functionName: "unstake",
        args: [BigInt(stakeIndex)],
      });
    } catch (error) {
      console.error("解除抵押失败:", error);
      throw error;
    }
  };

  // 计算投票券数量（使用 useReadContract hook）
  const { data: calculatedTickets } = useReadContract({
    address: stakingContractAddress,
    abi: StakingContractAbi,
    functionName: "calculateTickets",
    args: [BigInt(0), BigInt(7)], // 默认参数，实际使用时需要传入具体值
  });

  return {
    // 数据
    vDOTBalance: vDOTBalance ?? BigInt(0),
    allowance: allowance ?? BigInt(0),
    stakeCount: stakeCount ?? BigInt(0),
    totalStaked: totalStaked ?? BigInt(0),
    lockOptions,

    // 方法
    stake,
    unstake,
    calculatedTickets,

    // 状态
    isPending,
    error: writeError,

    // 合约地址
    stakingContractAddress,
    vDOTAddress,
  };
}

/**
 * 获取用户特定抵押记录的 Hook
 */
export function useUserStake(
  userAddress: string | undefined,
  stakeIndex: number,
) {
  const chainId = useChainId();
  const stakingContractAddress = getContractAddress(chainId, "StakingContract");

  const {
    data: stakeInfo,
    isLoading,
    error,
  } = useReadContract({
    address: stakingContractAddress,
    abi: StakingContractAbi,
    functionName: "getUserStake",
    args:
      userAddress && stakeIndex >= 0
        ? [userAddress, BigInt(stakeIndex)]
        : undefined,
  });

  const { data: canUnstake } = useReadContract({
    address: stakingContractAddress,
    abi: StakingContractAbi,
    functionName: "canUnstake",
    args:
      userAddress && stakeIndex >= 0
        ? [userAddress, BigInt(stakeIndex)]
        : undefined,
  });

  return {
    stakeInfo: stakeInfo as StakeInfo | undefined,
    canUnstake: canUnstake || false,
    isLoading,
    error,
  };
}
