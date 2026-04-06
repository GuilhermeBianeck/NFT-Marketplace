import { useAccount, useSigner, useProvider } from 'wagmi';

const defaultValue = {
  address: null,
  web3Provider: null,
  signer: null,
  isConnected: false,
  provider: null,
};

export function useWallet() {
  // wagmi hooks only work client-side when WagmiConfig is mounted
  if (typeof window === 'undefined') return defaultValue;

  try {
    const { address, isConnected } = useAccount();
    const { data: signer } = useSigner();
    const provider = useProvider();

    return {
      address: address || null,
      web3Provider: provider || null,
      signer: signer || null,
      isConnected: !!isConnected,
      provider: provider || null,
    };
  } catch {
    // If wagmi context isn't available yet (during hydration)
    return defaultValue;
  }
}
