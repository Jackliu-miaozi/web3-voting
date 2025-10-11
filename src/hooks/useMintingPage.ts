"use client";

import { useState, useMemo } from "react";
import { useAccount, useWriteContract, useChainId, useBalance } from "wagmi";
import { parseEther, formatEther } from "viem";
import { getContractAddress } from "@/config/contracts";
import vDOTAbi from "@/contracts/abis/vDOT.json";

export function useMintingPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [amount, setAmount] = useState("");

  // 获取合约地址
  const vDOTAddress = getContractAddress(chainId, "vDOT");

  // 获取 ETH 余额
  const { data: balance } = useBalance({
    address,
    query: {
      refetchInterval: 5000,
    },
  });

  // 铸造功能
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  // 1:1 兑换，无需复杂计算
  const vDOTAmount = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount))) {
      return "0";
    }
    return parseFloat(amount).toFixed(4);
  }, [amount]);

  // 存入 ETH 铸造 vDOT
  const deposit = () => {
    if (!address) {
      throw new Error("请先连接钱包");
    }

    if (!amount || parseFloat(amount) <= 0) {
      throw new Error("请输入有效的数量");
    }

    writeContract({
      address: vDOTAddress,
      abi: vDOTAbi,
      functionName: "deposit",
      value: parseEther(amount), // 发送 ETH
    });
  };

  // 格式化余额
  const formattedBalance = balance ? formatEther(balance.value) : "0";

  return {
    amount,
    setAmount,
    balance: formattedBalance,
    vDOTAmount,
    deposit,
    isPending,
    isSuccess,
    error,
    vDOTAddress,
  };
}
