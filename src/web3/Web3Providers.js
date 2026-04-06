import { useMemo } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig, useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { providers } from 'ethers';
import { wagmiConfig, chains } from './wagmiConfig';
import { WalletContext } from './WalletContext';

function WalletBridge({ children }) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const signer = useMemo(() => {
    if (!walletClient) return null;
    try {
      const { account, chain, transport } = walletClient;
      const network = { chainId: chain.id, name: chain.name };
      const provider = new providers.Web3Provider(transport, network);
      return provider.getSigner(account.address);
    } catch {
      return null;
    }
  }, [walletClient]);

  const web3Provider = useMemo(() => {
    if (!publicClient) return null;
    try {
      const { chain, transport } = publicClient;
      const network = { chainId: chain.id, name: chain.name };
      return new providers.Web3Provider(transport, network);
    } catch {
      return null;
    }
  }, [publicClient]);

  const value = {
    address: address || null,
    web3Provider,
    signer,
    isConnected: !!isConnected,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export default function Web3Providers({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <WalletBridge>
          {children}
        </WalletBridge>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
