"use client";

import {
  useReadContract,
  useWriteContract,
  useAccount,
  useChainId,
} from "wagmi";
import { useMemo } from "react";
import { getContractAddress } from "@/config/contracts";
import VotingContractAbi from "@/contracts/abis/VotingContract.json";
import VotingTicketAbi from "@/contracts/abis/VotingTicket.json";

/**
 * 投票选项枚举
 */
export enum VoteOption {
  TWO_YEARS = 0, // 2年内
  FOUR_YEARS = 1, // 4年内
  SIX_YEARS = 2, // 6年内
  EIGHT_YEARS = 3, // 8年内
  TEN_YEARS = 4, // 10年内
  NEVER = 5, // 永不会
}

/**
 * 投票选项配置
 */
export const VOTE_OPTIONS = [
  { value: VoteOption.TWO_YEARS, label: "2年内", description: "2025-2027年" },
  { value: VoteOption.FOUR_YEARS, label: "4年内", description: "2025-2029年" },
  { value: VoteOption.SIX_YEARS, label: "6年内", description: "2025-2031年" },
  { value: VoteOption.EIGHT_YEARS, label: "8年内", description: "2025-2033年" },
  { value: VoteOption.TEN_YEARS, label: "10年内", description: "2025-2035年" },
  {
    value: VoteOption.NEVER,
    label: "永不会",
    description: "BTC将永远保持第一",
  },
] as const;

/**
 * 用户投票信息
 */
export interface UserVote {
  option: VoteOption;
  ticketsUsed: bigint;
  votingPeriodId: bigint;
  timestamp: bigint;
  claimed: boolean;
}

/**
 * 投票统计信息
 */
export interface VoteStats {
  totalTickets: bigint;
  optionTickets: Record<VoteOption, bigint>;
}

/**
 * 投票合约交互 Hook
 */
export function useVotingContract() {
  const chainId = useChainId();
  const { address } = useAccount();

  const votingContractAddress = getContractAddress(chainId, "VotingContract");
  const votingTicketAddress = getContractAddress(chainId, "VotingTicket");

  // 写入合约方法
  const { writeContract, isPending, error: writeError } = useWriteContract();

  // 读取用户投票券余额
  const { data: ticketBalance } = useReadContract({
    address: votingTicketAddress,
    abi: VotingTicketAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // 读取用户对投票合约的授权额度
  const { data: ticketAllowance } = useReadContract({
    address: votingTicketAddress,
    abi: VotingTicketAbi,
    functionName: "allowance",
    args:
      address && votingContractAddress
        ? [address, votingContractAddress]
        : undefined,
  });

  // 读取当前投票期ID
  const { data: currentVotingPeriodId } = useReadContract({
    address: votingContractAddress,
    abi: VotingContractAbi,
    functionName: "currentVotingPeriodId",
  });

  // 读取当前投票期信息
  const { data: currentVotingPeriod } = useReadContract({
    address: votingContractAddress,
    abi: VotingContractAbi,
    functionName: "votingPeriods",
    args: currentVotingPeriodId ? [currentVotingPeriodId] : undefined,
  });

  // 读取用户投票记录数量
  const { data: userVoteCount } = useReadContract({
    address: votingContractAddress,
    abi: VotingContractAbi,
    functionName: "getUserVoteCount",
    args: address ? [address] : undefined,
  });

  // 检查用户是否已投票
  const hasVoted = useMemo(() => {
    return userVoteCount ? Number(userVoteCount) > 0 : false;
  }, [userVoteCount]);

  // 投票方法
  const vote = async (option: VoteOption, ticketsToUse: bigint) => {
    if (!address) {
      throw new Error("请先连接钱包");
    }

    if (!ticketBalance || (ticketBalance as bigint) < ticketsToUse) {
      throw new Error("投票券余额不足");
    }

    try {
      // 首先检查授权额度
      if (!ticketAllowance || (ticketAllowance as bigint) < ticketsToUse) {
        // 需要先授权投票券
        writeContract({
          address: votingTicketAddress,
          abi: VotingTicketAbi,
          functionName: "approve",
          args: [votingContractAddress, ticketsToUse],
        });
      }

      // 执行投票
      writeContract({
        address: votingContractAddress,
        abi: VotingContractAbi,
        functionName: "vote",
        args: [option, ticketsToUse],
      });
    } catch (error) {
      console.error("投票失败:", error);
      throw error;
    }
  };

  // 领取奖励方法
  const claimReward = async (voteIndex: number) => {
    if (!address) {
      throw new Error("请先连接钱包");
    }

    try {
      writeContract({
        address: votingContractAddress,
        abi: VotingContractAbi,
        functionName: "claimReward",
        args: [BigInt(voteIndex)],
      });
    } catch (error) {
      console.error("领取奖励失败:", error);
      throw error;
    }
  };

  return {
    // 数据
    ticketBalance: ticketBalance ?? BigInt(0),
    ticketAllowance: ticketAllowance ?? BigInt(0),
    currentVotingPeriodId: currentVotingPeriodId ?? BigInt(0),
    currentVotingPeriod,
    userVoteCount: userVoteCount ?? BigInt(0),
    hasVoted,

    // 方法
    vote,
    claimReward,

    // 状态
    isPending,
    error: writeError,

    // 合约地址
    votingContractAddress,
    votingTicketAddress,
  };
}

/**
 * 获取用户特定投票记录的 Hook
 */
export function useUserVote(
  userAddress: string | undefined,
  voteIndex: number,
) {
  const chainId = useChainId();
  const votingContractAddress = getContractAddress(chainId, "VotingContract");

  const {
    data: userVote,
    isLoading,
    error,
  } = useReadContract({
    address: votingContractAddress,
    abi: VotingContractAbi,
    functionName: "getUserVote",
    args:
      userAddress && voteIndex >= 0
        ? [userAddress, BigInt(voteIndex)]
        : undefined,
  });

  return {
    userVote: userVote as UserVote | undefined,
    isLoading,
    error,
  };
}

/**
 * 获取投票统计的 Hook
 */
export function useVoteStats(votingPeriodId?: bigint) {
  const chainId = useChainId();
  const votingContractAddress = getContractAddress(chainId, "VotingContract");

  const {
    data: voteStats,
    isLoading,
    error,
  } = useReadContract({
    address: votingContractAddress,
    abi: VotingContractAbi,
    functionName: "getVotingStats",
    args: votingPeriodId ? [votingPeriodId] : undefined,
  });

  // 格式化投票统计数据
  const formattedStats = useMemo(() => {
    if (!voteStats) return null;

    const [totalTickets, optionTicketsArray] = voteStats as [bigint, bigint[]];

    const optionTickets: Record<VoteOption, bigint> = {
      [VoteOption.TWO_YEARS]: optionTicketsArray[0] ?? BigInt(0),
      [VoteOption.FOUR_YEARS]: optionTicketsArray[1] ?? BigInt(0),
      [VoteOption.SIX_YEARS]: optionTicketsArray[2] ?? BigInt(0),
      [VoteOption.EIGHT_YEARS]: optionTicketsArray[3] ?? BigInt(0),
      [VoteOption.TEN_YEARS]: optionTicketsArray[4] ?? BigInt(0),
      [VoteOption.NEVER]: optionTicketsArray[5] ?? BigInt(0),
    };

    return {
      totalTickets,
      optionTickets,
    } as VoteStats;
  }, [voteStats]);

  return {
    stats: formattedStats,
    isLoading,
    error,
  };
}
