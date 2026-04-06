import { IconButton } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Account from './components/Account';
import { useWallet } from 'web3/WalletContext';
import { ellipseAddress } from './lib/utilities';

export const Login = () => {
  const { web3Provider, address, connect, disconnect } = useWallet();

  return (
    <div className="container">
      {web3Provider ? (
        <Account
          icon={`https://api.dicebear.com/5.x/identicon/svg?seed=${address}`}
          address={ellipseAddress(address)}
          fullAddress={address}
          handleLogout={disconnect}
        />
      ) : (
        <IconButton color="primary" onClick={connect} size="medium">
          <AccountBalanceWalletIcon fontSize="large" />
        </IconButton>
      )}
    </div>
  );
};

export default Login;
