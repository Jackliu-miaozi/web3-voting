"use client";

import {
  createContext,
  useContext,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { useWallet } from "@/hooks/useWallet";
import { usePolkadotWallet } from "@/hooks/usePolkadotWallet";

type WalletType = "evm" | "substrate" | null;

interface WalletContextValue {
  // Common
  walletType: WalletType;
  isConnected: boolean;
  address: string | undefined;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;

  // EVM specific (Moonbeam)
  evmWallet: ReturnType<typeof useWallet>;

  // Substrate specific (Bifrost, Polkadot)
  substrateWallet: ReturnType<typeof usePolkadotWallet>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * Unified wallet provider that manages both EVM and Substrate wallets
 */
export function WalletProvider({ children }: WalletProviderProps) {
  const [walletType, setWalletType] = useState<WalletType>(null);
  const evmWallet = useWallet();
  const substrateWallet = usePolkadotWallet();

  const connect = useCallback(
    async (type: WalletType) => {
      if (type === "evm") {
        evmWallet.connectWallet();
        setWalletType("evm");
      } else if (type === "substrate") {
        await substrateWallet.connect();
        setWalletType("substrate");
      }
    },
    [evmWallet, substrateWallet],
  );

  const disconnect = useCallback(() => {
    if (walletType === "evm") {
      evmWallet.disconnectWallet();
    } else if (walletType === "substrate") {
      substrateWallet.disconnect();
    }
    setWalletType(null);
  }, [walletType, evmWallet, substrateWallet]);

  const isConnected =
    (walletType === "evm" && evmWallet.isConnected) ||
    (walletType === "substrate" && substrateWallet.isConnected);

  const address =
    walletType === "evm"
      ? evmWallet.address
      : walletType === "substrate"
        ? substrateWallet.address
        : undefined;

  const isLoading = evmWallet.isPending || substrateWallet.isLoading;

  const value: WalletContextValue = {
    walletType,
    isConnected,
    address,
    connect,
    disconnect,
    isLoading,
    evmWallet,
    substrateWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

/**
 * Hook to access wallet context
 */
export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
}
