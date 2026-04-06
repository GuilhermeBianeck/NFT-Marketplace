import { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Divider,
  Typography,
  Stack,
  MenuItem,
  Avatar,
  Link,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MenuPopover from 'components/MenuPopover';
import usePendingBalance from 'hooks/usePendingBalance';
import useMarketplace from 'hooks/useMarketplace';

const MENU_OPTIONS = [
  { label: 'My Assets', route: '/assets' },
  { label: 'My Listings', route: '/listings' },
];

function Account({ address, icon, handleLogout }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const { balance, refresh } = usePendingBalance();
  const contract = useMarketplace({ requireSigner: true });

  const handleOpen = (event) => setOpen(event.currentTarget);
  const handleClose = () => setOpen(null);

  const handleWithdraw = useCallback(async () => {
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
    <>
      <Box display="flex" alignItems="center" gap={1}>
        {hasBalance && (
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={handleWithdraw}
            disabled={withdrawing}
            startIcon={withdrawing ? <CircularProgress size={14} color="inherit" /> : <AccountBalanceWalletIcon fontSize="small" />}
            sx={{ fontSize: '0.75rem', py: 0.5 }}
          >
            {balance} POL
          </Button>
        )}
        <IconButton
          ref={anchorRef}
          onClick={handleOpen}
          sx={{
            p: 0,
            ...(open && {
              '&:before': {
                zIndex: 1,
                content: "''",
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                position: 'absolute',
                bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
              },
            }),
          }}
        >
          <Avatar src={icon} alt="Account avatar" />
        </IconButton>
      </Box>
      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: 0.75,
          '& .MuiMenuItem-root': { typography: 'body2', borderRadius: 0.75 },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {address}
          </Typography>
        </Box>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem key={option.label} component={Link} href={option.route} onClick={handleClose}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
          Logout
        </MenuItem>
      </MenuPopover>
    </>
  );
}

Account.propTypes = {
  address: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  handleLogout: PropTypes.func.isRequired,
};

export default Account;
