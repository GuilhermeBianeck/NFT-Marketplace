import { useMemo } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { providers } from 'ethers';

const defaultValue = {
  address: null,
  web3Provider: null,
  signer: null,
  isConnected: false,
};

function walletClientToSigner(walletClient) {
  if (!walletClient) return null;
  const { account, chain, transport } = walletClient;
  const network = { chainId: chain.id, name: chain.name };
  const provider = new providers.Web3Provider(transport, network);
  return provider.getSigner(account.address);
}

export function useWallet() {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const signer = useMemo(
      () => walletClientToSigner(walletClient),
      [walletClient],
    );

    const web3Provider = useMemo(() => {
      if (!publicClient) return null;
      const { chain, transport } = publicClient;
      const network = { chainId: chain.id, name: chain.name };
      return new providers.Web3Provider(transport, network);
    }, [publicClient]);

    return {
      address: address || null,
      web3Provider: web3Provider || null,
      signer: signer || null,
      isConnected: !!isConnected,
    };
  } catch {
    return defaultValue;
  }
}
