"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useWalletContext } from "@/contexts/WalletContext";

export default function RevealPage() {
  const [oracleStatus] = useState({
    state: "监听中",
    lastCheck: "2025/02/26 12:00 UTC",
    nextCheck: "2025/02/27 12:00 UTC",
    triggerCondition: "任一竞争链市值 ≥ BTC",
  });
  const [winners] = useState([
    { address: "5Fsd...8P2K", reward: "传奇 NFT", option: "6 年内" },
    { address: "5Hb3...1QW9", reward: "稀有 NFT", option: "6 年内" },
    { address: "5Cv8...46D1", reward: "普通 NFT", option: "6 年内" },
  ]);
  const [timeline] = useState([
    {
      time: "2025/02/26",
      title: "Chainlink 监测",
      description: "竞争链市值达到 BTC 98%",
    },
    {
      time: "2025/03/05",
      title: "触发开奖",
      description: "竞争链市值首次超过 BTC",
    },
    {
      time: "2025/03/05",
      title: "NFT 发放",
      description: "预测正确用户获得奖励",
    },
  ]);

  const {
    isConnected: walletConnected,
    address: walletAddress,
    connect,
  } = useWalletContext();

  const connectWallet = () => connect("evm");

  return (
    <>
      <main className="container mx-auto max-w-6xl px-4 pt-16 pb-20">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">开奖与奖励</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
              Chainlink 每 24
              小时检测一次竞链市值，当条件达成时立即触发开奖并分发 NFT
              奖励。以下信息帮助您了解开奖进度与奖励领取方式。
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
            <span className="flex h-2 w-2 rounded-full bg-green-400" />
            Chainlink 状态：{oracleStatus.state}
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
              <h2 className="text-xl font-semibold">开奖监控面板</h2>
              <div className="mt-6 grid gap-4 text-sm text-white/70 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/50">最近一次检查</p>
                  <p className="mt-2 text-white">{oracleStatus.lastCheck}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/50">下一次检查</p>
                  <p className="mt-2 text-white">{oracleStatus.nextCheck}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/50">触发条件</p>
                  <p className="mt-2 text-white">
                    {oracleStatus.triggerCondition}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/50">奖励发放进度</p>
                  <p className="mt-2 text-white">已完成 60%</p>
                </div>
              </div>
              <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                提示：Chainlink
                结果将与平台服务端进行双重签名验证，确保开奖数据一致性。若您预测正确，请保持钱包在线以便领取
                NFT。
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">开奖时间线</h2>
                <span className="text-xs text-white/60">
                  示例数据 · 实际事件可追踪 Tx
                </span>
              </div>
              <div className="mt-4 space-y-4 text-sm text-white/70">
                {timeline.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-white/50">{item.time}</span>
                      <span
                        className="mt-2 h-full w-px bg-white/10"
                        aria-hidden
                      />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-base text-white">{item.title}</p>
                      <p className="mt-2 text-xs text-white/60">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">奖励领取指南</h2>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  <Link href="/docs/reward">查看详细教程</Link>
                </Button>
              </div>
              <ol className="mt-4 space-y-3 text-sm text-white/70">
                <li>1. Chainlink 触发开奖后，平台会在 5 分钟内发送通知。</li>
                <li>2. 连接钱包并确认奖励领取交易（仅需签名，免 gas）。</li>
                <li>3. 在“我的 NFT”中查看，本期奖励支持跨链展示。</li>
              </ol>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="text-xs tracking-wide text-white/60 uppercase">
                获奖名单
              </p>
              <div className="mt-4 space-y-4 text-sm text-white/70">
                {winners.map((winner) => (
                  <div
                    key={winner.address}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between font-mono text-xs text-white/50">
                      <span>{winner.address}</span>
                      <span>{winner.option}</span>
                    </div>
                    <p className="mt-2 text-base text-white">
                      奖励：{winner.reward}
                    </p>
                  </div>
                ))}
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-6 w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <Link href="/docs/winners">下载完整名单</Link>
              </Button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="text-xs tracking-wide text-white/60 uppercase">
                常见问题
              </p>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li>· 若预测正确但未收到奖励，请在 24 小时内提交工单。</li>
                <li>· NFT 将默认存放在 Moonbeam，可在稍后跨链至其他网络。</li>
                <li>· 奖励领取截止日期为开奖后 30 天。</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
