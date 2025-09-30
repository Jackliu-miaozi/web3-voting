"use client";

import { Button } from "@/components/ui/button";

interface HeaderProps {
  walletConnected: boolean;
  walletAddress: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function Header({
  walletConnected,
  walletAddress,
  onConnect,
  onDisconnect,
}: HeaderProps) {
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-lg">
      <div className="container mx-auto grid grid-cols-3 items-center px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500">
            <svg
              className="h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white">BTC 预测</h1>
            <p className="text-xs text-gray-400">Powered by vDOT</p>
          </div>
        </div>

        <nav className="hidden items-center justify-center md:flex">
          <div className="relative rounded-full border border-white/20 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="group flex items-center gap-1.5">
                <svg
                  className="h-4 w-4 text-cyan-400"
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
                <span className="text-sm text-cyan-300">抵押</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="group flex items-center gap-1.5">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <span className="text-sm text-purple-300">投票</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="group flex items-center gap-1.5">
                <svg
                  className="h-4 w-4 text-pink-400"
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
                <span className="text-sm text-pink-300">结果</span>
              </div>
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 blur-sm" />
          </div>
        </nav>

        <div className="flex justify-end">
          {walletConnected ? (
            <div className="flex items-center space-x-3">
              <div className="hidden items-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 sm:flex">
                <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <span className="text-sm text-white">
                  {formatAddress(walletAddress)}
                </span>
              </div>
              <Button
                onClick={onDisconnect}
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                断开
              </Button>
            </div>
          ) : (
            <Button
              onClick={onConnect}
              className="border-0 bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600"
            >
              连接钱包
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
