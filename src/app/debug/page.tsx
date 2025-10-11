"use client";

import { useAccount, useChainId, useBalance } from "wagmi";
import { useContractStats } from "@/hooks/useContractStats";

export default function DebugPage() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const contractStats = useContractStats();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold text-white">调试信息</h1>

      <div className="space-y-6">
        {/* 钱包连接状态 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            钱包连接状态
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">连接状态:</span>
              <span className={isConnected ? "text-green-400" : "text-red-400"}>
                {isConnected ? "已连接" : "未连接"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">钱包地址:</span>
              <span className="font-mono text-xs text-white">
                {address || "未连接"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">连接器:</span>
              <span className="text-white">{connector?.name || "无"}</span>
            </div>
          </div>
        </div>

        {/* 网络状态 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">网络状态</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">链 ID:</span>
              <span className="text-white">{chainId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">网络名称:</span>
              <span className="text-white">
                {chainId === 31337
                  ? "Hardhat Local"
                  : chainId === 1284
                    ? "Moonbeam"
                    : chainId === 1285
                      ? "Moonriver"
                      : "未知"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ETH 余额:</span>
              <span className="text-white">
                {balance
                  ? `${parseFloat(balance.formatted).toFixed(4)} ETH`
                  : "加载中..."}
              </span>
            </div>
          </div>
        </div>

        {/* 合约状态 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">合约状态</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">加载状态:</span>
              <span
                className={
                  contractStats.isLoading ? "text-yellow-400" : "text-green-400"
                }
              >
                {contractStats.isLoading ? "加载中..." : "已完成"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">错误状态:</span>
              <span
                className={
                  contractStats.hasError ? "text-red-400" : "text-green-400"
                }
              >
                {contractStats.hasError ? "有错误" : "正常"}
              </span>
            </div>
            {contractStats.hasError && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-xs text-red-400">
                  错误详情: {contractStats.error?.message || "未知错误"}
                </p>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">累计铸造:</span>
              <span className="text-white">{contractStats.totalMinted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">抵押总量:</span>
              <span className="text-white">{contractStats.totalStaked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">参与地址:</span>
              <span className="text-white">
                {contractStats.participantCount}
              </span>
            </div>
          </div>
        </div>

        {/* 操作建议 */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-blue-300">操作建议</h2>
          <div className="space-y-2 text-sm text-blue-200">
            {!isConnected && <p>⚠️ 请先连接钱包（点击右上角钱包按钮）</p>}
            {isConnected && chainId !== 31337 && (
              <p>⚠️ 请切换到 Hardhat Local 网络（链 ID: 31337）</p>
            )}
            {isConnected && chainId === 31337 && contractStats.hasError && (
              <p>⚠️ 网络连接正常，但合约读取失败。请检查：</p>
            )}
            {isConnected && chainId === 31337 && contractStats.hasError && (
              <ul className="ml-4 space-y-1 text-xs">
                <li>• Hardhat 节点是否正在运行</li>
                <li>• 合约地址是否正确</li>
                <li>• 浏览器控制台是否有错误</li>
              </ul>
            )}
            {isConnected && chainId === 31337 && !contractStats.hasError && (
              <p>✅ 一切正常！可以正常使用应用。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
