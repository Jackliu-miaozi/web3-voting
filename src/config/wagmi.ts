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
 * This config is a singleton - created once and reused across the app
 * to prevent WalletConnect from being initialized multiple times
 */
export const wagmiConfig = createConfig({
  chains: [moonbeam, moonriver],
  connectors: [
    // Injected connector for browser wallets (MetaMask, etc.)
    injected({
      target: "metaMask",
    }),
    // WalletConnect v2 - only initialize if project ID is available
    ...(projectId
      ? [
          walletConnect({
            projectId,
            metadata: {
              name: "Web3 Voting DApp",
              description: "BTC Future Prediction on Moonbeam & Bifrost",
              url:
                typeof window !== "undefined"
                  ? window.location.origin
                  : "https://localhost:3000",
              icons: [
                typeof window !== "undefined"
                  ? `${window.location.origin}/favicon.ico`
                  : "https://localhost:3000/favicon.ico",
              ],
            },
            showQrModal: true,
            qrModalOptions: {
              themeMode: "dark",
            },
          }),
        ]
      : []),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  multiInjectedProviderDiscovery: false, // Prevent multiple provider detection
  transports: {
    [moonbeam.id]: http(),
    [moonriver.id]: http(),
  },
});
