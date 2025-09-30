"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/voting/Header";
import { useDemoWallet } from "@/hooks/useDemoWallet";

const OPTIONS = [
  { value: 2, label: "2 年内", description: "2027 年前被超越" },
  { value: 4, label: "4 年内", description: "2029 年前被超越" },
  { value: 6, label: "6 年内", description: "2031 年前被超越" },
  { value: 8, label: "8 年内", description: "2033 年前被超越" },
  { value: 10, label: "10 年内", description: "2035 年前被超越" },
  { value: 99, label: "永不会", description: "BTC 将持续领先" },
];

export default function VotePage() {
  const [tickets, setTickets] = useState(48);
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [resultPreview] = useState([
    { label: "2 年内", percentage: 28 },
    { label: "4 年内", percentage: 22 },
    { label: "6 年内", percentage: 19 },
    { label: "8 年内", percentage: 14 },
    { label: "10 年内", percentage: 9 },
    { label: "永不会", percentage: 8 },
  ]);

  const resetState = () => {
    setSelected(null);
    setIsSubmitting(false);
    setHasSubmitted(false);
    setTickets(48);
  };

  const {
    walletConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    connecting,
  } = useDemoWallet({ onDisconnect: resetState });

  const handleSubmit = async () => {
    if (!walletConnected) {
      await connectWallet();
      return;
    }
    if (!selected) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setIsSubmitting(false);
    setHasSubmitted(true);
    setTickets(0);
  };

  const summary = useMemo(
    () => [
      { label: "投票券余额", value: `${tickets} 张` },
      { label: "当前选择", value: selected ? `${selected} 年` : "未选择" },
      { label: "Chainlink 状态", value: "监听中 (24h/次)" },
    ],
    [tickets, selected],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      <Header
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />

      <main className="container mx-auto max-w-6xl px-4 pt-16 pb-20">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">提交预测</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
              使用您的投票券预测比特币在未来几年内是否会被其他竞争链市值反超。提交后不可修改，请谨慎选择。
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
            <span className="flex h-2 w-2 rounded-full bg-purple-400" />
            当前投票券：{tickets}
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">选择预测年份</h2>
                  <p className="text-sm text-white/60">
                    提交后无法修改，投票券将被锁定。
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

              <div className="grid gap-4 md:grid-cols-2">
                {OPTIONS.map((option) => {
                  const isActive = selected === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => !hasSubmitted && setSelected(option.value)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        isActive
                          ? "border-white/50 bg-white/15"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      } ${hasSubmitted ? "cursor-not-allowed opacity-60" : ""}`}
                      disabled={hasSubmitted}
                    >
                      <p className="text-lg font-semibold text-white">
                        {option.label}
                      </p>
                      <p className="mt-2 text-sm text-white/60">
                        {option.description}
                      </p>
                      {isActive && (
                        <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/50 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
                          <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
                          已选择
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/60">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  投票券将一次性投入所选年份
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  开奖前不可更改选择
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  开奖后正确用户获 NFT 奖励
                </span>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={hasSubmitted || !selected || isSubmitting}
                className="mt-8 w-full border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-lg text-white hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {hasSubmitted
                  ? "已提交，等待开奖"
                  : isSubmitting
                    ? "提交中..."
                    : walletConnected
                      ? "确认投票"
                      : "连接钱包后投票"}
              </Button>
              <p className="mt-3 text-center text-xs text-white/50">
                开奖结果将同步至您的账户和邮箱通知，NFT 奖励将在 24 小时内发放。
              </p>
            </div>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">投票历史</h2>
                <span className="text-xs text-white/60">
                  示例数据 · 实际记录将读取链上 Tx
                </span>
              </div>
              <div className="mt-4 space-y-4 text-sm text-white/70">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>2025/02/21 18:05</span>
                    <span>已提交</span>
                  </div>
                  <p className="mt-2 text-base text-white">选择：6 年内</p>
                  <p className="mt-1 font-mono text-xs text-white/50">
                    Tx: 0x912e...af1
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="text-xs tracking-wide text-white/60 uppercase">
                我的概览
              </p>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                {summary.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <span className="text-white">{item.value}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant="outline"
                className="mt-6 w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <Link href="/reveal">查看开奖信息</Link>
              </Button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="text-xs tracking-wide text-white/60 uppercase">
                实时趋势
              </p>
              <div className="mt-4 space-y-3 text-sm text-white/70">
                {resultPreview.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="text-white">{item.percentage}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-white/50">
                数据每 30 秒刷新一次，展示全平台投票趋势，帮助您了解市场共识。
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
