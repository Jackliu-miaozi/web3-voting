"use client";

import { useState, useMemo } from "react";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useChainId,
  useBalance,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { getContractAddress } from "@/config/contracts";

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

  // 发送交易
  const {
    sendTransaction,
    isPending,
    error,
    data: hash,
  } = useSendTransaction();

  // 等待交易确认
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

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

    sendTransaction({
      to: vDOTAddress,
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
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    vDOTAddress,
  };
}
