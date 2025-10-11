import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, createPublicClient, http } from "viem";
import { getContractAddress } from "@/config/contracts";
import { useChainId } from "wagmi";
import { hardhat } from "viem/chains";

// Import ABIs
import votingContractAbi from "@/contracts/abis/VotingContract.json";
import votingTicketAbi from "@/contracts/abis/VotingTicket.json";

// Types for contract responses
interface UserVote {
  predictedYear: bigint;
  ticketsUsed: bigint;
  votingPeriodId: bigint;
  timestamp: bigint;
  claimed: boolean;
}

type VotingPeriod = [bigint, bigint, boolean, boolean, bigint]; // [startTime, endTime, active, resolved, correctAnswerYear]

export function useVotingContract() {
  const { address } = useAccount();
  const chainId = useChainId();

  // Contract addresses
  const votingContractAddress = getContractAddress(chainId, "VotingContract");
  const votingTicketAddress = getContractAddress(chainId, "VotingTicket");

  // Create public client for reading contract data
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http("http://localhost:8545"),
  });

  // Read user's voting ticket balance
  const { data: ticketBalance, refetch: refetchTicketBalance } =
    useReadContract({
      address: votingTicketAddress,
      abi: votingTicketAbi,
      functionName: "balanceOf",
      args: address ? [address] : undefined,
      query: {
        enabled: !!address,
        refetchInterval: 5000, // 每5秒自动刷新
        refetchOnWindowFocus: true, // 窗口聚焦时刷新
      },
    });

  // Read user's vote count
  const { data: userVoteCount } = useReadContract({
    address: votingContractAddress,
    abi: votingContractAbi,
    functionName: "getUserVoteCount",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
    },
  });

  // Read current voting period
  const { data: currentVotingPeriod } = useReadContract({
    address: votingContractAddress,
    abi: votingContractAbi,
    functionName: "currentVotingPeriodId",
    query: {
      enabled: !!address,
    },
  });

  // Read voting period info
  const { data: votingPeriodInfo } = useReadContract({
    address: votingContractAddress,
    abi: votingContractAbi,
    functionName: "votingPeriods",
    args: currentVotingPeriod ? [currentVotingPeriod] : undefined,
    query: {
      enabled: !!currentVotingPeriod,
    },
  });

  // Check allowance for voting tickets
  const { data: allowance } = useReadContract({
    address: votingTicketAddress,
    abi: votingTicketAbi,
    functionName: "allowance",
    args:
      address && votingContractAddress
        ? [address, votingContractAddress]
        : undefined,
    query: {
      enabled: !!address && !!votingContractAddress,
    },
  });

  // Write contract for voting ticket approval
  const {
    writeContract: approveVotingTickets,
    data: approvalTxHash,
    isPending: isApproving,
    error: approvalError,
  } = useWriteContract();

  // Write contract for voting
  const {
    writeContract: vote,
    data: voteTxHash,
    isPending: isVoting,
    error: voteError,
  } = useWriteContract();

  // Wait for approval transaction
  const { data: approvalReceipt, isLoading: isConfirmingApproval } =
    useWaitForTransactionReceipt({
      hash: approvalTxHash,
    });

  // Wait for vote transaction
  const { data: voteReceipt, isLoading: isConfirmingVote } =
    useWaitForTransactionReceipt({
      hash: voteTxHash,
    });

  // Approval function
  const approve = async (amount: bigint) => {
    if (!address || !votingContractAddress) {
      throw new Error("请先连接钱包");
    }

    approveVotingTickets({
      address: votingTicketAddress,
      abi: votingTicketAbi,
      functionName: "approve",
      args: [votingContractAddress, amount],
    });
  };

  // Vote function
  const submitVote = async (predictedYear: number, ticketsToUse: bigint) => {
    if (!address) {
      throw new Error("请先连接钱包");
    }

    if (!votingContractAddress) {
      throw new Error("投票合约地址未配置");
    }

    // Check if we have enough allowance
    const currentAllowance = (allowance as bigint) || 0n;
    if (currentAllowance < ticketsToUse) {
      throw new Error("投票券授权不足，请先授权");
    }

    vote({
      address: votingContractAddress,
      abi: votingContractAbi,
      functionName: "vote",
      args: [BigInt(predictedYear), ticketsToUse],
    });
  };

  // Complete voting flow (approve if needed, then vote)
  const completeVote = async (predictedYear: number, ticketsToUse: bigint) => {
    if (!address) {
      throw new Error("请先连接钱包");
    }

    const currentAllowance = (allowance as bigint) || 0n;

    // If allowance is insufficient, approve first
    if (currentAllowance < ticketsToUse) {
      await approve(ticketsToUse);

      // Wait for approval to complete
      return new Promise<void>((resolve, reject) => {
        const checkApproval = () => {
          if (approvalReceipt?.status === "success") {
            // Approval successful, now vote
            void submitVote(predictedYear, ticketsToUse);

            // Wait for vote to complete
            const checkVote = () => {
              if (voteReceipt?.status === "success") {
                resolve();
              } else if (voteReceipt?.status === "reverted") {
                reject(new Error("投票失败"));
              } else {
                // Still waiting for vote
                setTimeout(checkVote, 1000);
              }
            };

            // Start checking vote after a short delay
            setTimeout(checkVote, 1000);
          } else if (approvalReceipt?.status === "reverted") {
            reject(new Error("投票券授权失败"));
          } else {
            // Still waiting for approval
            setTimeout(checkApproval, 1000);
          }
        };

        // Start checking after a short delay
        setTimeout(checkApproval, 1000);
      });
    } else {
      // Sufficient allowance, vote directly
      void submitVote(predictedYear, ticketsToUse);

      // Wait for vote to complete
      return new Promise<void>((resolve, reject) => {
        const checkVote = () => {
          if (voteReceipt?.status === "success") {
            resolve();
          } else if (voteReceipt?.status === "reverted") {
            reject(new Error("投票失败"));
          } else {
            // Still waiting for vote
            setTimeout(checkVote, 1000);
          }
        };

        // Start checking after a short delay
        setTimeout(checkVote, 1000);
      });
    }
  };

  // Get user voting history
  const getUserVotingHistory = async () => {
    console.log(
      "🔍 getUserVotingHistory called - address:",
      address,
      "userVoteCount:",
      userVoteCount?.toString(),
    );

    if (!address || !userVoteCount) {
      console.log("❌ No address or vote count, returning empty array");
      return [];
    }

    const voteCount = Number(userVoteCount);
    console.log("📊 Processing", voteCount, "votes for address:", address);
    const history = [];

    for (let i = 0; i < voteCount; i++) {
      try {
        const vote = (await publicClient.readContract({
          address: votingContractAddress,
          abi: votingContractAbi,
          functionName: "getUserVote",
          args: [address, BigInt(i)],
        })) as UserVote;

        console.log(`  Vote data for index ${i}:`, vote);

        // Check if vote data is valid
        if (!vote || typeof vote !== "object" || !vote.predictedYear) {
          console.error(`Invalid vote data for index ${i}:`, vote);
          continue;
        }

        const votingPeriodId = vote.votingPeriodId;
        if (!votingPeriodId) {
          console.error(`No votingPeriodId for vote ${i}:`, vote);
          continue;
        }

        // Get voting period info
        const period = (await publicClient.readContract({
          address: votingContractAddress,
          abi: votingContractAbi,
          functionName: "votingPeriods",
          args: [votingPeriodId],
        })) as VotingPeriod;

        console.log(
          `  Period data for votingPeriodId ${votingPeriodId}:`,
          period,
        );

        // Check if period data is valid
        if (!period || period.length < 5) {
          console.error(
            `Invalid period data for votingPeriodId ${votingPeriodId}:`,
            period,
          );
          continue;
        }

        // Format the vote data
        const voteData = {
          index: i,
          predictedYear: Number(vote.predictedYear), // predictedYear
          ticketsUsed: formatEther(vote.ticketsUsed), // ticketsUsed
          votingPeriodId: Number(vote.votingPeriodId), // votingPeriodId
          timestamp: new Date(Number(vote.timestamp) * 1000), // timestamp
          claimed: vote.claimed, // claimed
          periodStartTime: new Date(Number(period[0]) * 1000),
          periodEndTime: new Date(Number(period[1]) * 1000),
          periodActive: period[2],
          periodResolved: period[3],
          correctAnswerYear: Number(period[4]),
        };

        history.push(voteData);
      } catch (error) {
        console.error(`Error fetching vote ${i}:`, error);
      }
    }

    // Sort by timestamp (newest first)
    return history.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  };

  return {
    // Data
    ticketBalance: (ticketBalance as bigint) || 0n,
    currentVotingPeriod: (currentVotingPeriod as bigint) || 0n,
    votingPeriodInfo,
    allowance: (allowance as bigint) || 0n,
    userVoteCount: (userVoteCount as bigint) || 0n,

    // Transaction hashes
    approvalTxHash,
    voteTxHash,

    // Loading states
    isApproving,
    isVoting,
    isConfirmingApproval,
    isConfirmingVote,

    // Error states
    approvalError,
    voteError,

    // Receipts
    approvalReceipt,
    voteReceipt,

    // Functions
    approve,
    submitVote,
    completeVote,
    refetchTicketBalance,
    getUserVotingHistory,

    // Computed values
    isPending:
      isApproving || isVoting || isConfirmingApproval || isConfirmingVote,
    hasError: !!approvalError || !!voteError,
    error: approvalError ?? voteError,
  };
}
