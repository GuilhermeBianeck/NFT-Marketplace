import { createContext, useContext, useCallback, useEffect, useReducer } from 'react';
import { providers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from '@coinbase/wallet-sdk';
import Web3Modal from 'web3modal';

const WalletContext = createContext(null);

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    package: WalletLink,
    connector: async (_, options) => {
      const { appName, networkUrl, chainId } = options;
      const walletLink = new WalletLink({ appName });
      const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
      await provider.enable();
      return provider;
    },
  },
};

let web3Modal;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: 'matic',
    cacheProvider: true,
    providerOptions,
  });
}

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

export function WalletProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { provider, web3Provider, address, chainId } = state;

  const connect = useCallback(async () => {
    const provider = await web3Modal.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    const network = await web3Provider.getNetwork();

    dispatch({
      type: 'SET_WEB3_PROVIDER',
      provider,
      web3Provider,
      address,
      chainId: network.chainId,
    });
  }, []);

  const disconnect = useCallback(async () => {
    await web3Modal.clearCachedProvider();
    if (provider?.disconnect && typeof provider.disconnect === 'function') {
      await provider.disconnect();
    }
    dispatch({ type: 'RESET_WEB3_PROVIDER' });
  }, [provider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect();
    }
  }, [connect]);

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
