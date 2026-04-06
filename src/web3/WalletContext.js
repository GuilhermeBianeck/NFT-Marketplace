import { createContext, useContext } from 'react';

const WalletContext = createContext(null);

const defaultValue = {
  address: null,
  web3Provider: null,
  signer: null,
  isConnected: false,
};

export function useWallet() {
  const context = useContext(WalletContext);
  return context || defaultValue;
}

export { WalletContext };
export default WalletContext;
