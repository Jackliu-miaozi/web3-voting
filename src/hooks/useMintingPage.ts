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

  // 获取原生代币余额
  const { data: balance } = useBalance({
    address,
    query: {
      refetchInterval: 5000,
    },
  });

  // 铸造功能
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  // 计算预计获得的 vDOT（0.98 比率）
  const calculations = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount))) {
      return {
        vDOTAmount: "0",
        networkFee: "0",
        serviceFee: "0",
        total: "0",
      };
    }

    const inputAmount = parseFloat(amount);
    const exchangeRate = 0.98; // 1 DOT = 0.98 vDOT
    const vDOTAmount = inputAmount * exchangeRate;
    const networkFee = 0.12; // 固定网络费用
    const serviceFee = 0.02; // 固定服务费用

    return {
      vDOTAmount: vDOTAmount.toFixed(2),
      networkFee: networkFee.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      total: vDOTAmount.toFixed(2),
    };
  }, [amount]);

  // 铸造函数
  const mint = async () => {
    if (!address) {
      throw new Error("请先连接钱包");
    }

    if (!amount || parseFloat(amount) <= 0) {
      throw new Error("请输入有效的数量");
    }

    const vDOTAmount = parseEther(calculations.vDOTAmount);

    writeContract({
      address: vDOTAddress,
      abi: vDOTAbi,
      functionName: "mint",
      args: [address, vDOTAmount],
    });
  };

  // 格式化余额
  const formattedBalance = balance ? formatEther(balance.value) : "0";

  return {
    amount,
    setAmount,
    balance: formattedBalance,
    calculations,
    mint,
    isPending,
    isSuccess,
    error,
    vDOTAddress,
  };
}
