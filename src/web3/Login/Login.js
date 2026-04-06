import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import usePendingBalance from 'hooks/usePendingBalance';
import useMarketplace from 'hooks/useMarketplace';
import { useCallback, useState } from 'react';
import { Button, CircularProgress, Box, Tooltip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export const Login = () => {
  const { isConnected } = useAccount();
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
      <ConnectButton
        chainStatus="icon"
        showBalance={false}
        accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
      />
    </Box>
  );
};

export default Login;
