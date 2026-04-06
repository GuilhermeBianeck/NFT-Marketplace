import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import useMarketplace from './useMarketplace';
import { useWallet } from 'web3/WalletContext';

export default function usePendingBalance() {
  const { address } = useWallet();
  const contract = useMarketplace();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!address) {
      setBalance('0');
      return;
    }
    try {
      setLoading(true);
      const pending = await contract.pendingWithdrawal(address);
      setBalance(ethers.utils.formatEther(pending));
    } catch (err) {
      console.error('Error fetching pending balance:', err);
    } finally {
      setLoading(false);
    }
  }, [address, contract]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { balance, loading, refresh };
}
