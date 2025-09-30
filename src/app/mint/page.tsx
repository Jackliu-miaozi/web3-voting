"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWalletContext } from "@/contexts/WalletContext";

export default function MintPage() {
  const [dotBalance, setDotBalance] = useState(280.32);
  const [dotAmount, setDotAmount] = useState("10");
  const [vdotAmount, setVdotAmount] = useState("9.8");
  const [status, setStatus] = useState<"idle" | "processing" | "completed">(
    "idle",
  );
  const [history, setHistory] = useState([
    {
      id: "0x8fa2...32c",
      dot: 12.5,
      vdot: 12.24,
      time: "2025/02/26 13:20",
      status: "已完成",
    },
    {
      id: "0x7bc1...b41",
      dot: 8,
      vdot: 7.82,
      time: "2025/02/24 09:12",
      status: "已完成",
    },
  ]);
  const [bridgeStep, setBridgeStep] = useState(0);

  const resetState = () => {
    setStatus("idle");
    setBridgeStep(0);
    setDotAmount("10");
    setVdotAmount("9.8");
  };

  const {
    isConnected: walletConnected,
    address: walletAddress,
    connect,
    isLoading: connecting,
  } = useWalletContext();

  const connectWallet = () => connect("evm");

  const exchangeRate = useMemo(() => 0.98, []);
  const networkFee = useMemo(() => 0.12, []);
  const serviceFee = useMemo(() => 0.02, []);

  const updateAmounts = (value: string) => {
    setDotAmount(value);
    const parsed = parseFloat(value) || 0;
    setVdotAmount(parsed > 0 ? (parsed * exchangeRate).toFixed(2) : "");
  };

  const handleMint = async () => {
    if (!walletConnected) {
      await connectWallet();
      return;
    }

    if (!dotAmount || parseFloat(dotAmount) <= 0) return;

    setStatus("processing");
    setBridgeStep(1);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setBridgeStep(2);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setBridgeStep(3);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const dot = parseFloat(dotAmount);
    const vdot = parseFloat(vdotAmount);

    setDotBalance((prev) => Math.max(prev - dot, 0));
    setHistory((prev) => [
      {
        id: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random()
          .toString(16)
          .slice(2, 5)}`,
        dot,
        vdot,
        time: new Date().toLocaleString("zh-CN", { hour12: false }),
        status: "已完成",
      },
      ...prev,
    ]);

    setStatus("completed");
    setTimeout(() => {
      setStatus("idle");
      setBridgeStep(0);
    }, 1200);
  };

  return (
    <>
      <main className="container mx-auto max-w-6xl px-4 pt-16 pb-20">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">铸造 vDOT</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
              通过 SLPx 跨链桥完成 DOT → vDOT 跨链兑换，系统将自动处理在
              Moonbeam 和 Bifrost 网络之间的传输与确认。
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
            当前汇率 1 DOT ≈ {exchangeRate} vDOT
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">输入兑换数量</h2>
                  <p className="text-sm text-white/60">
                    余额：{dotBalance.toFixed(2)} DOT
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
                <div>
                  <label className="mb-2 block text-xs tracking-wide text-white/60 uppercase">
                    DOT 数量
                  </label>
                  <Input
                    value={dotAmount}
                    onChange={(event) => updateAmounts(event.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    className="border-white/20 bg-white/5 text-lg text-white placeholder:text-white/40"
                    placeholder="0.00"
                  />
                  <p className="mt-2 text-xs text-white/50">
                    输入想要跨链的 DOT 数量。
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs tracking-wide text-white/60 uppercase">
                    预计获得 vDOT
                  </label>
                  <Input
                    value={vdotAmount}
                    readOnly
                    className="border-white/20 bg-white/5 text-lg text-white"
                  />
                  <p className="mt-2 text-xs text-white/50">
                    自动根据当前汇率计算。
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <div className="flex items-center justify-between">
                  <span>兑换比例</span>
                  <span>1 DOT → {exchangeRate} vDOT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>网络手续费</span>
                  <span>{networkFee} DOT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>服务费</span>
                  <span>{serviceFee} DOT</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-white">
                  <span>预计到账</span>
                  <span>
                    {vdotAmount || "0.00"} vDOT
                    <span className="ml-2 text-xs text-white/60">
                      （约 3 ~ 5 分钟）
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/50">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  桥接网络：Moonbeam → Bifrost
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  自动跳转抵押页面
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  支持自定义 Gas (即将上线)
                </span>
              </div>

              <Button
                onClick={handleMint}
                disabled={status === "processing" || !dotAmount}
                className="mt-8 w-full border-0 bg-gradient-to-r from-cyan-500 to-purple-500 text-lg text-white hover:from-cyan-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "processing"
                  ? "跨链处理中..."
                  : status === "completed"
                    ? "铸造成功"
                    : walletConnected
                      ? "确认铸造"
                      : "连接钱包后开始"}
              </Button>
              <p className="mt-3 text-center text-xs text-white/50">
                铸造完成后将跳转至抵押页面，帮助您立即换取投票券。
              </p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="text-xs tracking-wide text-white/60 uppercase">
                跨链进度
              </p>
              <ol className="mt-4 space-y-4 text-sm text-white/70">
                {[
                  "提交铸造交易",
                  "SLPx 跨链执行",
                  "Bifrost 接收并铸造",
                  "vDOT 回传到 Moonbeam",
                ].map((step, index) => {
                  const current = index + 1;
                  const active = bridgeStep >= current;
                  return (
                    <li key={step} className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                          active
                            ? "border-cyan-400 bg-cyan-500/20 text-white"
                            : "border-white/20 bg-white/5 text-white/50"
                        }`}
                      >
                        {current}
                      </span>
                      <span className={active ? "text-white" : "text-white/60"}>
                        {step}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-4 text-xs text-white/50">
                若 10 分钟内未到账，可使用交易 Hash
                向客服提交工单，我们将协助追踪跨链状态。
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="text-xs tracking-wide text-white/60 uppercase">
                网络提示
              </p>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li>· 请确保钱包已切换到 Moonbeam 网络。</li>
                <li>· 铸造过程中请勿关闭浏览器或切换账户。</li>
                <li>· 若交易失败，DOT 将自动退回原地址。</li>
              </ul>
              <Button
                asChild
                variant="outline"
                className="mt-6 w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <Link href="/stake">前往抵押</Link>
              </Button>
            </div>
          </aside>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">铸造记录</h2>
            <span className="text-xs text-white/60">
              示例数据 · 铸造记录将存储于链上并可导出 CSV
            </span>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm text-white/70">
              <thead>
                <tr className="text-left text-xs tracking-wide text-white/50 uppercase">
                  <th className="pb-3">交易哈希</th>
                  <th className="pb-3">DOT</th>
                  <th className="pb-3">vDOT</th>
                  <th className="pb-3">时间</th>
                  <th className="pb-3">状态</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-t border-white/5">
                    <td className="py-3 font-mono text-white/80">{item.id}</td>
                    <td className="py-3">{item.dot.toFixed(2)}</td>
                    <td className="py-3">{item.vdot.toFixed(2)}</td>
                    <td className="py-3">{item.time}</td>
                    <td className="py-3">
                      <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
