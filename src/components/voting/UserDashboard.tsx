"use client";

interface UserDashboardProps {
  dotBalance: number;
  mintedVdot: number;
  stakedAmount: number;
  votingPower: number;
  ticketBalance: number;
  hasVoted: boolean;
}

export function UserDashboard({
  dotBalance,
  mintedVdot,
  stakedAmount,
  votingPower,
  ticketBalance,
  hasVoted,
}: UserDashboardProps) {
  const cards = [
    {
      label: "Moonbeam DOT",
      value: `${dotBalance.toFixed(2)} DOT`,
      helper: "钱包余额",
      iconColor: "text-cyan-300",
      icon: (
        <svg
          className="h-5 w-5"
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
      ),
    },
    {
      label: "已铸造 vDOT",
      value: `${mintedVdot.toFixed(2)} vDOT`,
      helper: "跨链成功",
      iconColor: "text-purple-300",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7l8-4 8 4-8 4-8-4z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11l8-4"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l8-4"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7l8 4v8"
          />
        </svg>
      ),
    },
    {
      label: "已抵押",
      value: `${stakedAmount.toFixed(2)} vDOT`,
      helper: "锁定合约",
      iconColor: "text-emerald-300",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11c1.657 0 3-.895 3-2s-1.343-2-3-2-3 .895-3 2 1.343 2 3 2zm0 0c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zm0 0V7m0 4v4m0 4v1"
          />
        </svg>
      ),
    },
    {
      label: "投票权",
      value: `${votingPower.toFixed(0)} 票`,
      helper: "可用票券",
      iconColor: "text-amber-300",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 17l10-10"
          />
        </svg>
      ),
    },
    {
      label: "票券余额",
      value: `${ticketBalance.toFixed(0)} 张`,
      helper: "待投票",
      iconColor: "text-pink-300",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7l9 6 9-6-9-5-9 5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 17l9 5 9-5"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l9 5 9-5"
          />
        </svg>
      ),
    },
    {
      label: "投票状态",
      value: hasVoted ? "已提交" : "待参与",
      helper: hasVoted ? "等待开奖" : "完成抵押即可投票",
      iconColor: hasVoted ? "text-green-300" : "text-yellow-300",
      icon: hasVoted ? (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="mb-16" aria-labelledby="dashboard-title">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2
            id="dashboard-title"
            className="text-2xl font-semibold text-white"
          >
            我的控制台
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            已铸造与抵押数据实时同步，所有票券均与链上资产 1:1 绑定。
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
          <span className="flex h-2 w-2 rounded-full bg-green-400" />
          状态正常
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
          >
            <div className="mb-3 flex items-center justify-between text-sm text-white/60">
              <span>{card.label}</span>
              <span className={card.iconColor}>{card.icon}</span>
            </div>
            <p className="text-2xl font-semibold text-white">{card.value}</p>
            <p className="mt-1 text-xs text-white/60">{card.helper}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
