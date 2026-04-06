import { useState, useEffect, useCallback } from 'react';
import { useWallet } from 'web3/WalletContext';
import usePendingBalance from 'hooks/usePendingBalance';
import useMarketplace from 'hooks/useMarketplace';
import { Button, CircularProgress, Box, Tooltip, IconButton } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

function ConnectButtonWrapper() {
  const [RKButton, setRKButton] = useState(null);

  useEffect(() => {
    import('@rainbow-me/rainbowkit').then((mod) => {
      setRKButton(() => mod.ConnectButton);
    });
  }, []);

  if (!RKButton) {
    return (
      <Tooltip title="Connect Wallet">
        <IconButton color="primary" size="medium" aria-label="Connect Wallet">
          <AccountBalanceWalletIcon fontSize="large" />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <RKButton
      chainStatus="icon"
      showBalance={false}
      accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
    />
  );
}

export const Login = () => {
  const { isConnected } = useWallet();
  const { balance, refresh } = usePendingBalance();
  const contract = useMarketplace({ requireSigner: true });
  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = useCallback(async () => {
    if (!contract) return;
    try {
      setWithdrawing(true);
      const tx = await contract.withdraw();
      await tx.wait();
      refresh();
    } catch (err) {
      console.error('Withdraw error:', err);
    } finally {
      setWithdrawing(false);
    }
  }, [contract, refresh]);

  const hasBalance = parseFloat(balance) > 0;

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {isConnected && hasBalance && (
        <Tooltip title="Withdraw funds">
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={handleWithdraw}
            disabled={withdrawing}
            startIcon={
              withdrawing ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <AccountBalanceWalletIcon fontSize="small" />
              )
            }
            sx={{ fontSize: '0.75rem', py: 0.5 }}
          >
            {balance} POL
          </Button>
        </Tooltip>
      )}
      <ConnectButtonWrapper />
    </Box>
  );
};

export default Login;
