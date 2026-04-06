import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '12335d506f3a93ef8eef4bdce6a9f34e';

const { chains, publicClient } = configureChains(
  [polygon],
  [
    jsonRpcProvider({
      rpc: () => ({ http: 'https://polygon-bor-rpc.publicnode.com' }),
    }),
  ],
);

const { connectors } = getDefaultWallets({
  appName: 'Bioma NFT Marketplace',
  projectId,
  chains,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export { chains };
