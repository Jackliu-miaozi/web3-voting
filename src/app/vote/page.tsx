"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useWalletContext } from "@/contexts/WalletContext";
import { useStakingContract } from "@/hooks/useStakingContract";

const generateYearOptions = () => {
  const options = [];
  const startYear = 2025;

  // Generate 20 preset year ranges: 2025-2027, 2027-2029, ..., 2063-2065
  for (let i = 0; i < 20; i++) {
    const rangeStart = startYear + i * 2;
    const rangeEnd = rangeStart + 2;
    options.push({
      value: rangeEnd, // Use end year as value
      label: `${rangeStart}-${rangeEnd}年`,
      description: `${rangeEnd} 年前被超越`,
    });
  }

  return options;
};

const OPTIONS = generateYearOptions();

export default function VotePage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [votedOption, setVotedOption] = useState<string>("");
  const [customYear, setCustomYear] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const router = useRouter();
  const [resultPreview] = useState([
    { label: "2025-2027年", percentage: 15 },
    { label: "2027-2029年", percentage: 18 },
    { label: "2029-2031年", percentage: 22 },
    { label: "2031-2033年", percentage: 16 },
    { label: "2033-2035年", percentage: 12 },
    { label: "其他年份", percentage: 17 },
  ]);

  // 从智能合约获取真实的投票券余额
  const { ticketBalance } = useStakingContract();
  const tickets = Number(ticketBalance) / 1e18; // 转换为可读格式

  const {
    isConnected: walletConnected,
    connect,
    isLoading: connecting,
  } = useWalletContext();

  const connectWallet = () => connect("evm");

  const handleSubmit = async () => {
    if (!walletConnected) {
      await connectWallet();
      return;
    }

    let selectedValue = selected;
    let selectedLabel = "";

    if (showCustomInput && customYear) {
      selectedValue = parseInt(customYear);

      // Calculate nearest odd year as start
      const inputYear = selectedValue;
      const rangeStart = inputYear % 2 === 0 ? inputYear - 1 : inputYear;
      const rangeEnd = rangeStart + 2;

      selectedLabel = `${rangeStart}-${rangeEnd}年`;
      selectedValue = rangeEnd; // Use end year as value for consistency
    } else {
      const selectedOption = OPTIONS.find(
        (option) => option.value === selected,
      );
      selectedLabel = selectedOption?.label || "";
    }

    if (!selectedValue) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setIsSubmitting(false);
    setHasSubmitted(true);

    setVotedOption(selectedLabel);
    setShowSuccessModal(true);
  };

  const summary = useMemo(
    () => [
      { label: "投票券余额", value: `${tickets.toFixed(2)} 张` },
      {
        label: "当前选择",
        value:
          showCustomInput && customYear
            ? (() => {
                const inputYear = parseInt(customYear);
                const rangeStart =
                  inputYear % 2 === 0 ? inputYear - 1 : inputYear;
                const rangeEnd = rangeStart + 2;
                return `${rangeStart}-${rangeEnd}年`;
              })()
            : selected
              ? OPTIONS.find((o) => o.value === selected)?.label || "未选择"
              : "未选择",
      },
      { label: "Chainlink 状态", value: "监听中 (24h/次)" },
    ],
    [tickets, selected, showCustomInput, customYear],
  );

  return (
    <>
      {/* 投票成功模态框 */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl">
            <div className="text-center">
              {/* 成功图标 */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20">
                <svg
                  className="h-8 w-8 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {/* 成功标题 */}
              <h3 className="mb-2 text-2xl font-semibold text-white">
                投票成功！
              </h3>
              <p className="mb-6 text-sm text-white/70">
                您已成功提交预测：{votedOption}
              </p>

              {/* 投票详情 */}
              <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-white/60">预测选项</span>
                  <span className="text-white">{votedOption}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-white/60">投票券使用</span>
                  <span className="text-white">{tickets.toFixed(2)} 张</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-white/60">投票状态</span>
                  <span className="text-green-400">已锁定</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-white/60">开奖时间</span>
                  <span className="text-white/60">Chainlink 触发后</span>
                </div>
              </div>

              {/* 下一步指引 */}
              <div className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                    <svg
                      className="h-4 w-4 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-purple-400">
                      下一步：等待开奖
                    </p>
                    <p className="text-xs text-white/60">
                      关注开奖页面获取最新信息和 NFT 奖励
                    </p>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSuccessModal(false)}
                  variant="outline"
                  className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  继续投票
                </Button>
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push("/reveal");
                  }}
                  className="flex-1 border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                >
                  查看开奖
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            当前投票券：{tickets.toFixed(2)}
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

                {/* Custom year input option */}
                <button
                  onClick={() => !hasSubmitted && setShowCustomInput(true)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    showCustomInput
                      ? "border-white/50 bg-white/15"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  } ${hasSubmitted ? "cursor-not-allowed opacity-60" : ""}`}
                  disabled={hasSubmitted}
                >
                  <p className="text-lg font-semibold text-white">自定义年份</p>
                  <p className="mt-2 text-sm text-white/60">输入您预测的年份</p>
                  {showCustomInput && (
                    <div className="mt-4 space-y-2">
                      <input
                        type="number"
                        min={2027}
                        value={customYear}
                        onChange={(e) => {
                          setCustomYear(e.target.value);
                          setSelected(parseInt(e.target.value));
                        }}
                        placeholder="如: 2049"
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {customYear && (
                        <div className="text-xs text-white/60">
                          将配对为:{" "}
                          {(() => {
                            const inputYear = parseInt(customYear);
                            if (isNaN(inputYear)) return "";
                            const rangeStart =
                              inputYear % 2 === 0 ? inputYear - 1 : inputYear;
                            const rangeEnd = rangeStart + 2;
                            return `${rangeStart}-${rangeEnd}年`;
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                  {showCustomInput && customYear && (
                    <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/50 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
                      <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
                      已选择
                    </span>
                  )}
                </button>
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
    </>
  );
}
