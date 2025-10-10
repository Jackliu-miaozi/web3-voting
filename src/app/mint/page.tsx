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
    calculations,
    mint,
    isPending,
    isSuccess,
    error,
  } = useMintingPage();

  if (!address) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <h1 className="mb-4 text-3xl font-bold text-white">铸造 vDOT</h1>
          <p className="mb-6 text-gray-400">请先连接钱包以开始铸造 vDOT</p>
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
          <h1 className="text-3xl font-bold text-white">铸造 vDOT</h1>
          <p className="mt-2 text-gray-400">
            通过 SLPx 跨链桥完成 DOT → vDOT 跨链铸造，系统将自动处理在 Moonbeam
            和 Bifrost 网络之间的传输与确认。
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-cyan-300">当前汇率</p>
          <p className="text-lg font-semibold text-white">1 DOT ≈ 0.98 vDOT</p>
        </div>
      </div>

      {/* 输入卡片 */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h2 className="mb-6 text-xl font-semibold text-white">输入兑换数量</h2>
        <p className="mb-4 text-sm text-gray-400">余额：{balance} ETH</p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* DOT 输入 */}
          <div>
            <label className="mb-2 block text-sm text-gray-300">DOT 数量</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10"
              className="border-white/20 bg-white/5 text-white"
            />
            <p className="mt-2 text-xs text-gray-500">
              输入想要铸造的 DOT 数量
            </p>
          </div>

          {/* vDOT 预计 */}
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              预计获得 VDOT
            </label>
            <Input
              type="text"
              value={calculations.vDOTAmount}
              readOnly
              className="border-white/20 bg-white/5 text-white"
            />
            <p className="mt-2 text-xs text-gray-500">自动根据当前汇率计算</p>
          </div>
        </div>

        {/* 费用明细 */}
        <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">兑换比例</span>
            <span className="text-white">1 DOT → 0.98 vDOT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">网络手续费</span>
            <span className="text-white">{calculations.networkFee} DOT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">服务费</span>
            <span className="text-white">{calculations.serviceFee} DOT</span>
          </div>
          <div className="border-t border-white/10 pt-3" />
          <div className="flex justify-between">
            <span className="font-semibold text-white">预计到账</span>
            <span className="text-xl font-bold text-cyan-300">
              {calculations.total} vDOT
            </span>
          </div>
        </div>

        {/* 桥接网络说明 */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
          <span>桥接网络: Moonbeam → Bifrost</span>
          <span>支持自定义 Gas (即将上线)</span>
        </div>

        {/* 确认按钮 */}
        <Button
          onClick={mint}
          disabled={isPending || !amount || parseFloat(amount) <= 0}
          className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "铸造中..." : "确认铸造"}
        </Button>

        {/* 状态提示 */}
        {isSuccess && (
          <div className="mt-4 text-center">
            <p className="mb-2 text-sm text-green-400">
              ✅ 铸造成功！后将跳转至抵押页面
            </p>
            <Link
              href="/stake"
              className="inline-block text-sm text-cyan-300 underline hover:text-cyan-200"
            >
              立即前往抵押页面
            </Link>
          </div>
        )}
        {error && (
          <p className="mt-4 text-center text-sm text-red-400">
            ❌ {error.message}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          铸造完成后将跳转至抵押页面，帮助您立即获取投票权。
        </p>
      </div>
    </div>
  );
}
