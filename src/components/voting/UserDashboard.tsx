"use client";

interface UserDashboardProps {
  stakedAmount: number;
  votingPower: number;
  hasVoted: boolean;
}

export function UserDashboard({
  stakedAmount,
  votingPower,
  hasVoted,
}: UserDashboardProps) {
  return (
    <div className="rounded-2xl border border-white/20 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-6 backdrop-blur-lg">
      <h2 className="mb-6 text-white">我的仪表板</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">已抵押</span>
            <svg
              className="h-5 w-5 text-cyan-400"
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
          </div>
          <div className="text-2xl text-white">{stakedAmount.toFixed(2)}</div>
          <div className="mt-1 text-xs text-gray-400">vDOT</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">投票权</span>
            <svg
              className="h-5 w-5 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="text-2xl text-white">{votingPower}</div>
          <div className="mt-1 text-xs text-gray-400">票数</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">投票状态</span>
            {hasVoted ? (
              <svg
                className="h-5 w-5 text-green-400"
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
            ) : (
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
          <div className="text-2xl text-white">
            {hasVoted ? "已投票" : "未投票"}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {hasVoted ? "感谢您的参与" : "请使用投票权"}
          </div>
        </div>
      </div>
    </div>
  );
}
