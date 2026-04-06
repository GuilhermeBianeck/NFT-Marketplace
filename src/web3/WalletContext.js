import { createContext, useContext, useCallback, useEffect, useReducer, useState } from 'react';
import { providers } from 'ethers';
import Web3Modal from 'web3modal';

const WalletContext = createContext(null);

const initialState = {
  provider: null,
  web3Provider: null,
  address: null,
  chainId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_WEB3_PROVIDER':
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        chainId: action.chainId,
      };
    case 'SET_ADDRESS':
      return { ...state, address: action.address };
    case 'SET_CHAIN_ID':
      return { ...state, chainId: action.chainId };
    case 'RESET_WEB3_PROVIDER':
      return initialState;
    default:
      return state;
  }
}

function getWeb3Modal() {
  if (typeof window === 'undefined') return null;
  return new Web3Modal({
    network: 'matic',
    cacheProvider: true,
  });
}

export function WalletProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mounted, setMounted] = useState(false);
  const { provider, web3Provider, address, chainId } = state;

  useEffect(() => {
    setMounted(true);
  }, []);

  const connect = useCallback(async () => {
    try {
      const modal = getWeb3Modal();
      if (!modal) return;
      const rawProvider = await modal.connect();
      const web3Provider = new providers.Web3Provider(rawProvider);
      const signer = web3Provider.getSigner();
      const addr = await signer.getAddress();
      const network = await web3Provider.getNetwork();

      dispatch({
        type: 'SET_WEB3_PROVIDER',
        provider: rawProvider,
        web3Provider,
        address: addr,
        chainId: network.chainId,
      });
    } catch (err) {
      console.error('Wallet connect error:', err);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const modal = getWeb3Modal();
      if (modal) await modal.clearCachedProvider();
      if (provider?.disconnect && typeof provider.disconnect === 'function') {
        await provider.disconnect();
      }
      dispatch({ type: 'RESET_WEB3_PROVIDER' });
    } catch (err) {
      console.error('Wallet disconnect error:', err);
    }
  }, [provider]);

  // Auto connect to cached provider (client-side only)
  useEffect(() => {
    if (!mounted) return;
    const modal = getWeb3Modal();
    if (modal?.cachedProvider) {
      connect();
    }
  }, [mounted, connect]);

  // Listen for account/chain changes
  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        dispatch({ type: 'SET_ADDRESS', address: accounts[0] });
      };
      const handleChainChanged = () => window.location.reload();
      const handleDisconnect = () => disconnect();

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
          provider.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [provider, disconnect]);

  return (
    <WalletContext.Provider
      value={{ provider, web3Provider, address, chainId, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

const defaultValue = {
  provider: null,
  web3Provider: null,
  address: null,
  chainId: null,
  connect: () => {},
  disconnect: () => {},
};

export function useWallet() {
  const context = useContext(WalletContext);
  return context || defaultValue;
}

export default WalletContext;
