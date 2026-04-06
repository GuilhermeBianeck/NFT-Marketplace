import { useMemo } from 'react';
import { ethers } from 'ethers';
import Marketplace from 'contracts/Marketplace.sol/Marketplace.json';
import { RPC_URL, MARKETPLACE_ADDRESS } from 'config';
import { useWallet } from 'web3/WalletContext';

export default function useMarketplace({ requireSigner = false } = {}) {
  const { signer } = useWallet();

  const contract = useMemo(() => {
    const address = MARKETPLACE_ADDRESS?.trim();
    if (!address) return null;

    if (requireSigner && signer) {
      return new ethers.Contract(address, Marketplace.abi, signer);
    }

    if (typeof window === 'undefined') return null;

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    return new ethers.Contract(address, Marketplace.abi, provider);
  }, [signer, requireSigner]);

  return contract;
}
