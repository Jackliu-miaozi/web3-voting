import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { walletConnect, injected } from "wagmi/connectors";
import { moonbeam, moonriver } from "./chains";

// Get WalletConnect project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn(
    "⚠️  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Get one at https://cloud.walletconnect.com",
  );
}

/**
 * Wagmi configuration for EVM chains (Moonbeam, Moonriver)
 */
export const wagmiConfig = createConfig({
  chains: [moonbeam, moonriver],
  connectors: [
    // Injected connector for browser wallets (MetaMask, etc.)
    injected({
      target: "metaMask",
    }),
    // WalletConnect v2
    ...(projectId
      ? [
          walletConnect({
            projectId,
            metadata: {
              name: "Web3 Voting DApp",
              description: "BTC Future Prediction on Moonbeam & Bifrost",
              url: "https://your-domain.com",
              icons: ["https://your-domain.com/icon.png"],
            },
            showQrModal: true,
          }),
        ]
      : []),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [moonbeam.id]: http(),
    [moonriver.id]: http(),
  },
});
