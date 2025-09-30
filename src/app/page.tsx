"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/voting/Header";
import {
  ActionCallouts,
  AssetOverview,
  ChainlinkStatusCard,
  ConnectWalletPanel,
  FaqSection,
  MissionChecklist,
  ProcessTimeline,
} from "@/components/voting/HomeSections";
import { StakeSection } from "@/components/voting/StakeSection";
import { UserDashboard } from "@/components/voting/UserDashboard";
import { VoteResults } from "@/components/voting/VoteResults";
import { VoteSection } from "@/components/voting/VoteSection";
import { useDemoWallet } from "@/hooks/useDemoWallet";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const FALLBACK_LAST_MINT = "约 2 小时前";

type StakePayload = {
  stakedAmount?: number;
  votingPower?: number;
  dotBalance?: number;
  mintedVdot?: number;
  ticketBalance?: number;
  lastMintTime?: string;
  error?: string;
};

type VotePayload = {
  hasVoted?: boolean;
  ticketBalance?: number;
  votingPower?: number;
  error?: string;
};

export default function Home() {
  const [stakedAmount, setStakedAmount] = useState(0);
  const [votingPower, setVotingPower] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [dotBalance, setDotBalance] = useState(0);
  const [mintedVdot, setMintedVdot] = useState(0);
  const [ticketBalance, setTicketBalance] = useState(0);
  const [lastMintTime, setLastMintTime] = useState<string | null>(null);
  const [communityJoined, setCommunityJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadUserData = async (address: string) => {
    try {
      setLoading(true);

      if (!API_BASE_URL) {
        setDotBalance(356.42);
        setMintedVdot(128.5);
        setTicketBalance(42);
        setStakedAmount(24.5);
        setVotingPower(24);
        setHasVoted(false);
        setLastMintTime(FALLBACK_LAST_MINT);
        return;
      }

      const stakeRes = await fetch(`${API_BASE_URL}/stake/${address}`);
      const stakeData = (await stakeRes.json()) as StakePayload;
      setStakedAmount(stakeData.stakedAmount ?? 0);
      setVotingPower(stakeData.votingPower ?? 0);
      setDotBalance(stakeData.dotBalance ?? 0);
      setMintedVdot(stakeData.mintedVdot ?? stakeData.stakedAmount ?? 0);
      setTicketBalance(stakeData.ticketBalance ?? stakeData.votingPower ?? 0);
      setLastMintTime(stakeData.lastMintTime ?? FALLBACK_LAST_MINT);

      const voteRes = await fetch(`${API_BASE_URL}/vote/${address}`);
      const voteData = (await voteRes.json()) as VotePayload;
      setHasVoted(voteData.hasVoted ?? false);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStakedAmount(0);
    setVotingPower(0);
    setHasVoted(false);
    setDotBalance(0);
    setMintedVdot(0);
    setTicketBalance(0);
    setLastMintTime(null);
    setLoading(false);
  };

  const {
    walletConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    connecting,
  } = useDemoWallet({
    onConnect: async (address) => {
      await loadUserData(address);
    },
    onDisconnect: resetState,
  });

  const handleStake = async (amount: number) => {
    try {
      if (!API_BASE_URL) {
        setStakedAmount((prev) => prev + amount);
        setVotingPower((prev) => prev + amount);
        setTicketBalance((prev) => prev + amount);
        setMintedVdot((prev) => Math.max(prev - amount, 0));
        return;
      }

      const response = await fetch(`${API_BASE_URL}/stake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: walletAddress, amount }),
      });

      const data = (await response.json()) as StakePayload;

      if (response.ok) {
        setStakedAmount(data.stakedAmount ?? stakedAmount);
        setVotingPower(data.votingPower ?? votingPower);
        setDotBalance(data.dotBalance ?? dotBalance);
        setMintedVdot(data.mintedVdot ?? mintedVdot);
        setTicketBalance(data.ticketBalance ?? ticketBalance);
        setLastMintTime(
          data.lastMintTime ?? lastMintTime ?? FALLBACK_LAST_MINT,
        );
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
        setHasVoted(true);
        setTicketBalance((prev) => Math.max(prev - votingPower, 0));
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

      const data = (await response.json()) as VotePayload & {
        success?: boolean;
      };

      if (response.ok) {
        setHasVoted(true);
        setTicketBalance(data.ticketBalance ?? ticketBalance);
        setVotingPower(data.votingPower ?? votingPower);
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

  const tasks = useMemo(
    () => [
      {
        label: "连接钱包",
        done: walletConnected,
        description: "切换到 Moonbeam 网络并授权扩展。",
      },
      {
        label: "铸造 vDOT",
        done: mintedVdot > 0,
        description: "通过 SLPx 桥完成 DOT → vDOT 兑换。",
      },
      {
        label: "抵押 vDOT",
        done: stakedAmount > 0,
        description: "在平台合约内锁定 vDOT 获得票券。",
      },
      {
        label: "提交预测",
        done: hasVoted,
        description: "选择年份并确认交易，等待 Chainlink 开奖。",
      },
      {
        label: "加入 TG 社区",
        done: communityJoined,
        description: "进入 Telegram 群获取开奖提醒与最新活动。",
      },
    ],
    [walletConnected, mintedVdot, stakedAmount, hasVoted, communityJoined],
  );

  const heroMetrics = useMemo(
    () => [
      { label: "累计铸造", value: "128,520 vDOT" },
      { label: "抵押总量", value: "92,310 vDOT" },
      { label: "参与地址", value: "8,236" },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 text-white">
      <Header
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />

      <main className="container mx-auto max-w-7xl px-4 pt-16 pb-20">
        <section className="relative mb-16 grid gap-10 lg:grid-cols-[2fr,1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-[0.2em] text-white/60 uppercase">
              2025 赛季 · 预测竞赛
            </span>
            <h1 className="mt-6 text-4xl leading-tight font-semibold md:text-5xl lg:text-6xl">
              一次点击完成 DOT 跨链抵押，预测 BTC 的未来拐点
            </h1>
            <p className="mt-4 max-w-3xl text-base text-white/70 md:text-lg">
              连接 Moonbeam 钱包，自动调用 Bifrost SLPx 铸造
              vDOT，锁定资产换取投票券，Chainlink
              预言机实时监听竞链市值并在触发时发放预测者 NFT。
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {walletConnected ? (
                <Button
                  asChild
                  className="border-0 bg-gradient-to-r from-cyan-500 to-purple-500 px-8 text-white hover:from-cyan-600 hover:to-purple-600"
                >
                  <Link href="/mint">前往铸造页面</Link>
                </Button>
              ) : (
                <Button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="border-0 bg-gradient-to-r from-cyan-500 to-purple-500 px-8 text-white hover:from-cyan-600 hover:to-purple-600"
                >
                  {connecting ? "连接中..." : "连接钱包"}
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="border-white/30 bg-white/5 px-8 text-white hover:bg-white/10"
              >
                <Link href="#flow">了解完整流程</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-green-400" />
                {loading ? "同步链上数据..." : "链上状态正常"}
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-cyan-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3"
                  />
                </svg>
                {lastMintTime
                  ? `最近一次铸造：${lastMintTime}`
                  : "等待铸造记录"}
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-purple-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Chainlink 监听频次：24h/次
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/70">实时进度</p>
              <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                Live
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {heroMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <span className="text-white/60">{metric.label}</span>
                  <span className="text-lg font-semibold text-white">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-white/50">
              数据示意：当前版本展示演示数据，实际部署后将实时读取 Moonbeam /
              Bifrost / Chainlink 的链上状态。
            </p>
          </div>
        </section>

        <ProcessTimeline />

        {!walletConnected && (
          <ConnectWalletPanel
            onConnect={connectWallet}
            isConnecting={connecting}
          />
        )}

        <ActionCallouts
          hasVoted={hasVoted}
          communityJoined={communityJoined}
          onJoinCommunity={() => setCommunityJoined(true)}
        />

        {walletConnected && (
          <>
            <UserDashboard
              dotBalance={dotBalance}
              mintedVdot={mintedVdot}
              stakedAmount={stakedAmount}
              votingPower={votingPower}
              ticketBalance={ticketBalance}
              hasVoted={hasVoted}
            />

            <AssetOverview
              walletConnected={walletConnected}
              dotBalance={dotBalance}
              mintedVdot={mintedVdot}
              stakedAmount={stakedAmount}
              votingPower={votingPower}
              ticketBalance={ticketBalance}
            />

            <section className="mb-16 grid gap-6 lg:grid-cols-[1.65fr,1fr]">
              <div className="space-y-6">
                <section id="stake" aria-labelledby="stake-title">
                  <h2
                    id="stake-title"
                    className="mb-4 text-xl font-semibold text-white"
                  >
                    抵押并获取投票券
                  </h2>
                  <StakeSection
                    onStake={handleStake}
                    currentStaked={stakedAmount}
                  />
                </section>

                <section id="vote" aria-labelledby="vote-title">
                  <h2
                    id="vote-title"
                    className="mb-4 text-xl font-semibold text-white"
                  >
                    选择预测年份
                  </h2>
                  <VoteSection
                    votingPower={votingPower}
                    hasVoted={hasVoted}
                    onVote={handleVote}
                  />
                </section>
              </div>

              <div className="space-y-6">
                <VoteResults />
                <ChainlinkStatusCard />
              </div>
            </section>
          </>
        )}

        <MissionChecklist tasks={tasks} />
        <FaqSection />
      </main>

      <footer className="border-t border-white/10 bg-black/20">
        <div className="container mx-auto max-w-7xl px-4 py-10 text-sm text-white/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p>© 2025 BTC 未来预测平台 · Moonbeam & Bifrost 联合支持</p>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <Link href="/docs/security" className="hover:text-white">
                安全审计报告
              </Link>
              <Link href="/docs/tokenomics" className="hover:text-white">
                经济模型
              </Link>
              <Link href="/docs/support" className="hover:text-white">
                联系支持
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
