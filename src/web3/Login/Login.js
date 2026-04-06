import { IconButton, Tooltip } from '@mui/material';
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
        <Tooltip title="Connect Wallet">
          <IconButton color="primary" onClick={connect} size="medium" aria-label="Connect Wallet">
            <AccountBalanceWalletIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default Login;
