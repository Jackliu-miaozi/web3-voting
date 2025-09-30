"use client";

import { useState } from "react";
import { Header } from "@/components/voting/Header";
import { StakeSection } from "@/components/voting/StakeSection";
import { VoteSection } from "@/components/voting/VoteSection";
import { VoteResults } from "@/components/voting/VoteResults";
import { UserDashboard } from "@/components/voting/UserDashboard";

// API Base URL - will be configured via environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [stakedAmount, setStakedAmount] = useState(0);
  const [votingPower, setVotingPower] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load user data
  const loadUserData = async (address: string) => {
    try {
      setLoading(true);

      if (!API_BASE_URL) {
        // Mock data for development
        setStakedAmount(0);
        setVotingPower(0);
        setHasVoted(false);
        setLoading(false);
        return;
      }

      // Get stake info
      const stakeRes = await fetch(`${API_BASE_URL}/stake/${address}`);
      const stakeData = await stakeRes.json();
      setStakedAmount(stakeData.stakedAmount || 0);
      setVotingPower(stakeData.votingPower || 0);

      // Get vote info
      const voteRes = await fetch(`${API_BASE_URL}/vote/${address}`);
      const voteData = await voteRes.json();
      setHasVoted(voteData.hasVoted || false);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    // Simulate wallet connection
    // In production, use @polkadot/extension-dapp or similar
    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockAddress =
        "5" + Math.random().toString(36).substring(2, 15).toUpperCase();
      setWalletAddress(mockAddress);
      setWalletConnected(true);

      // Load user data
      await loadUserData(mockAddress);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress("");
    setStakedAmount(0);
    setVotingPower(0);
    setHasVoted(false);
  };

  const handleStake = async (amount: number) => {
    try {
      if (!API_BASE_URL) {
        // Mock stake for development
        setStakedAmount((prev) => prev + amount);
        setVotingPower((prev) => prev + amount);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/stake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: walletAddress,
          amount,
        }),
      });

      const data = (await response.json()) as {
        stakedAmount: number;
        votingPower: number;
        error?: string;
      };

      if (response.ok) {
        setStakedAmount(data.stakedAmount);
        setVotingPower(data.votingPower);
      } else {
        const errorMsg = data.error ?? "未知错误";
        console.error("Error staking:", errorMsg);
        alert("抵押失败: " + errorMsg);
      }
    } catch (error) {
      console.error("Error staking:", error);
      alert("抵押失败，请重试");
    }
  };

  const handleVote = async (yearOption: number) => {
    if (votingPower <= 0) return;

    try {
      if (!API_BASE_URL) {
        // Mock vote for development
        setHasVoted(true);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: walletAddress,
          option: yearOption,
          votingPower,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (response.ok) {
        setHasVoted(true);
        console.log("Vote submitted successfully:", data);
      } else {
        const errorMsg = data.error ?? "未知错误";
        console.error("Error voting:", errorMsg);
        alert("投票失败: " + errorMsg);
      }
    } catch (error) {
      console.error("Error voting:", error);
      alert("投票失败，请重试");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
      <Header
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 pt-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-4xl text-transparent text-white md:text-6xl">
            BTC 未来预测平台
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-300">
            抵押 vDOT 代币获得投票权，预测比特币何时会被竞争链超越
          </p>
        </div>

        {!walletConnected ? (
          <div className="mx-auto max-w-md rounded-2xl border border-white/20 bg-white/10 p-12 text-center backdrop-blur-lg">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-purple-500">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="mb-4 text-2xl text-white">连接钱包开始</h2>
            <p className="mb-8 text-gray-300">
              请连接您的 Web3 钱包以抵押 vDOT 并参与投票
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <UserDashboard
                stakedAmount={stakedAmount}
                votingPower={votingPower}
                hasVoted={hasVoted}
              />

              <StakeSection
                onStake={handleStake}
                currentStaked={stakedAmount}
              />

              <VoteSection
                votingPower={votingPower}
                hasVoted={hasVoted}
                onVote={handleVote}
              />
            </div>

            <div className="lg:col-span-1">
              <VoteResults />
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20">
              <svg
                className="h-6 w-6 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-white">抵押 vDOT</h3>
            <p className="text-sm text-gray-400">
              抵押您的 vDOT 代币以获得平台投票权，1 vDOT = 1 投票权
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
              <svg
                className="h-6 w-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-white">参与投票</h3>
            <p className="text-sm text-gray-400">
              使用您的投票权预测比特币何时会被其他区块链超越
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/20">
              <svg
                className="h-6 w-6 text-pink-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-white">查看结果</h3>
            <p className="text-sm text-gray-400">
              实时查看社区投票趋势和预测结果分布
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>© 2025 BTC 未来预测平台 | 基于 Polkadot 生态构建</p>
        </div>
      </footer>
    </div>
  );
}
