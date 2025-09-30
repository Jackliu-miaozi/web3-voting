"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWalletContext } from "@/contexts/WalletContext";

const LOCK_OPTIONS = [
  { label: "7 天 (默认)", value: 7, multiplier: 1 },
  { label: "30 天", value: 30, multiplier: 1.1 },
  { label: "90 天", value: 90, multiplier: 1.3 },
] as const;

export default function StakePage() {
  const [vdotBalance, setVdotBalance] = useState(96.4);
  const [stakeAmount, setStakeAmount] = useState("32");
  const [selectedLock, setSelectedLock] = useState(LOCK_OPTIONS[0]);
  const [tickets, setTickets] = useState(54);
  const [history, setHistory] = useState([
    {
      time: "2025/02/26 15:30",
      amount: 24,
      lockDays: 7,
      status: "生效中",
      tx: "0x914a...aa1",
    },
    {
      time: "2025/02/20 10:05",
      amount: 12,
      lockDays: 30,
      status: "锁定中",
      tx: "0xab32...b44",
    },
  ]);
  const [isStaking, setIsStaking] = useState(false);

  const resetState = () => {
    setStakeAmount("32");
    setSelectedLock(LOCK_OPTIONS[0]);
    setIsStaking(false);
  };

  const {
    isConnected: walletConnected,
    address: walletAddress,
    connect,
    isLoading: connecting,
  } = useWalletContext();

  const connectWallet = () => connect("evm");

  const projectedTickets = useMemo(() => {
    const amount = parseFloat(stakeAmount) || 0;
    return amount > 0 ? amount * selectedLock.multiplier : 0;
  }, [stakeAmount, selectedLock]);

  const stake = async () => {
    if (!walletConnected) {
      await connectWallet();
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (!amount || amount <= 0 || amount > vdotBalance) return;

    setIsStaking(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setVdotBalance((prev) => Math.max(prev - amount, 0));
    setTickets((prev) => prev + projectedTickets);
    setHistory((prev) => [
      {
        time: new Date().toLocaleString("zh-CN", { hour12: false }),
        amount,
        lockDays: selectedLock.value,
        status: "锁定中",
        tx: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random()
          .toString(16)
          .slice(2, 5)}`,
      },
      ...prev,
    ]);
    setIsStaking(false);
  };

  return (
    <>
      <main className="container mx-auto max-w-6xl px-4 pt-16 pb-20">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">抵押 vDOT</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
              将 vDOT
              锁定于平台抵押合约以换取投票券，合约由项目方托管但不可操作资金，仅用于代理治理投票。
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
            <span className="flex h-2 w-2 rounded-full bg-green-400" />
            合约审计：已完成 · 2024 Q4
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">抵押表单</h2>
                  <p className="text-sm text-white/60">
                    可用余额：{vdotBalance.toFixed(2)} vDOT
                  </p>
                </div>
                {!walletConnected && (
                  <Button
                    onClick={connectWallet}
                    disabled={connecting}
                    className="border-0 bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600"
                  >
                    {connecting ? "连接中..." : "连接钱包"}
                  </Button>
                )}
              </div>

              <label className="mb-2 block text-xs tracking-wide text-white/60 uppercase">
                抵押数量
              </label>
              <Input
                value={stakeAmount}
                onChange={(event) => setStakeAmount(event.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="border-white/20 bg-white/5 text-lg text-white placeholder:text-white/40"
                placeholder="0.00"
              />
              <div className="mt-3 flex gap-2 text-xs text-white/60">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    onClick={() =>
                      setStakeAmount(((vdotBalance * percent) / 100).toFixed(2))
                    }
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 hover:border-white/30"
                  >
                    {percent}%
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <p className="mb-2 text-xs tracking-wide text-white/60 uppercase">
                  锁定周期
                </p>
                <div className="grid gap-2 md:grid-cols-3">
                  {LOCK_OPTIONS.map((option) => {
                    const active = option.value === selectedLock.value;
                    return (
                      <button
                        key={option.value}
                        // 修复类型不兼容问题，确保 setSelectedLock 的类型与 option 匹配
                        onClick={() =>
                          setSelectedLock(option as typeof selectedLock)
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-white/40 bg-white/15"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <p className="text-sm font-medium text-white">
                          {option.label}
                        </p>
                        <p className="mt-1 text-xs text-white/60">
                          奖励倍率 x{option.multiplier.toFixed(2)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <div className="flex items-center justify-between">
                  <span>预计获得票券</span>
                  <span className="text-white">
                    {projectedTickets.toFixed(2)} 张
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>当前票券余额</span>
                  <span className="text-white">{tickets} 张</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-white">
                  <span>预计可解锁时间</span>
                  <span>锁定后第 {selectedLock.value} 天</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3 text-xs text-white/60">
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                抵押成功后将自动生成投票券（vTicket），并存入您的账户。
              </div>

              <Button
                onClick={stake}
                disabled={isStaking || !stakeAmount}
                className="mt-8 w-full border-0 bg-gradient-to-r from-cyan-500 to-purple-500 text-lg text-white hover:from-cyan-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStaking
                  ? "抵押处理中..."
                  : walletConnected
                    ? "确认抵押"
                    : "连接钱包后抵押"}
              </Button>
              <p className="mt-3 text-center text-xs text-white/50">
                解锁需要经历安全等待期，期间可查看抵押状态但无法提前转出。
              </p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="text-xs tracking-wide text-white/60 uppercase">
                锁仓信息
              </p>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li>· 合约地址：0x3a8...fE23</li>
                <li>· 审计机构：SlowMist（2024 Q4）</li>
                <li>· 项目方仅可发起治理代理，无法转出资产。</li>
              </ul>
              <Button
                asChild
                variant="outline"
                className="mt-6 w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <Link href="/docs/audit">查看审计报告</Link>
              </Button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="text-xs tracking-wide text-white/60 uppercase">
                抵押历史
              </p>
              <div className="mt-4 space-y-4 text-sm text-white/70">
                {history.map((item) => (
                  <div
                    key={item.tx}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>{item.time}</span>
                      <span>{item.status}</span>
                    </div>
                    <p className="mt-2 text-base text-white">
                      {item.amount.toFixed(2)} vDOT · 锁定 {item.lockDays} 天
                    </p>
                    <p className="mt-1 font-mono text-xs text-white/50">
                      Tx: {item.tx}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
