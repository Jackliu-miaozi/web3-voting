"use client";

import { useMintingPage } from "@/hooks/useMintingPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccount } from "wagmi";
import Link from "next/link";

export default function MintPage() {
  const { address } = useAccount();
  const {
    amount,
    setAmount,
    balance,
    vDOTAmount,
    deposit,
    isPending,
    isSuccess,
    error,
  } = useMintingPage();

  if (!address) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <h1 className="mb-4 text-3xl font-bold text-white">
            存入 ETH 铸造 vDOT
          </h1>
          <p className="mb-6 text-gray-400">
            请先连接钱包以开始存入 ETH 并铸造 vDOT
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 text-white transition-all hover:from-cyan-600 hover:to-purple-600"
          >
            返回首页连接钱包
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      {/* 标题区域 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">存入 ETH 铸造 vDOT</h1>
          <p className="mt-2 text-gray-400">
            直接存入 ETH，按 1:1 比例自动铸造 vDOT。vDOT 是 ETH
            的封装代币，可随时赎回。
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-cyan-300">兑换比例</p>
          <p className="text-lg font-semibold text-white">1 ETH = 1 vDOT</p>
        </div>
      </div>

      {/* 输入卡片 */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h2 className="mb-6 text-xl font-semibold text-white">输入存入数量</h2>
        <p className="mb-4 text-sm text-gray-400">
          可用余额：{parseFloat(balance).toFixed(4)} ETH
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* ETH 输入 */}
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              存入 ETH 数量
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="输入 ETH 数量"
              className="border-white/20 bg-white/5 text-white"
            />
            <p className="mt-2 text-xs text-gray-500">
              输入想要存入的 ETH 数量
            </p>
          </div>

          {/* vDOT 预计 */}
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              将获得 vDOT
            </label>
            <Input
              type="text"
              value={vDOTAmount}
              readOnly
              className="border-white/20 bg-white/5 text-white"
            />
            <p className="mt-2 text-xs text-gray-500">1:1 比例自动计算</p>
          </div>
        </div>

        {/* 兑换说明 */}
        <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">兑换比例</span>
            <span className="text-white">1 ETH = 1 vDOT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Gas 费用</span>
            <span className="text-white">由网络决定</span>
          </div>
          <div className="border-t border-white/10 pt-3" />
          <div className="flex justify-between">
            <span className="font-semibold text-white">预计获得</span>
            <span className="text-xl font-bold text-cyan-300">
              {vDOTAmount} vDOT
            </span>
          </div>
        </div>

        {/* 说明文字 */}
        <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-gray-300">
          <p className="mb-2 font-semibold text-cyan-300">💡 关于 vDOT</p>
          <ul className="space-y-1 text-xs">
            <li>• vDOT 是 ETH 的 1:1 封装代币（类似 WETH）</li>
            <li>• 存入的 ETH 会被锁定在智能合约中</li>
            <li>• 你可以随时通过销毁 vDOT 来赎回等量的 ETH</li>
            <li>• vDOT 可用于抵押以获得投票券</li>
          </ul>
        </div>

        {/* 确认按钮 */}
        <Button
          onClick={deposit}
          disabled={isPending || !amount || parseFloat(amount) <= 0}
          className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "存入中..." : "确认存入"}
        </Button>

        {/* 状态提示 */}
        {isSuccess && (
          <div className="mt-4 text-center">
            <p className="mb-2 text-sm text-green-400">
              ✅ 存入成功！vDOT 已铸造到你的钱包
            </p>
            <Link
              href="/stake"
              className="inline-block text-sm text-cyan-300 underline hover:text-cyan-200"
            >
              立即前往抵押页面获取投票权 →
            </Link>
          </div>
        )}
        {error && (
          <p className="mt-4 text-center text-sm text-red-400">
            ❌ {error.message}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          存入完成后，你可以前往抵押页面，将 vDOT 抵押以获取投票券。
        </p>
      </div>
    </div>
  );
}
