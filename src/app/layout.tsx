import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Web3Provider } from "@/providers/Web3Provider";
import { WalletProvider } from "@/contexts/WalletContext";
import { HeaderWithWallet } from "@/components/voting/HeaderWithWallet";

export const metadata: Metadata = {
  title: "Web3 Voting - BTC Future Prediction",
  description:
    "Decentralized voting platform on Moonbeam & Bifrost powered by Chainlink",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 text-white">
        <TRPCReactProvider>
          <Web3Provider>
            <WalletProvider>
              <HeaderWithWallet />
              {children}
            </WalletProvider>
          </Web3Provider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
