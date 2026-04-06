import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { ethers } from 'ethers';

import Main from 'layouts/Main';
import Container from 'components/Container';
import TransactionStatus from 'components/TransactionStatus';
import { useWallet } from 'web3/WalletContext';
import useMarketplace from 'hooks/useMarketplace';

export default function Admin() {
  const { address } = useWallet();
  const readContract = useMarketplace();
  const writeContract = useMarketplace({ requireSigner: true });

  const [owner, setOwner] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [paused, setPaused] = useState(false);
  const [listingPrice, setListingPrice] = useState('');
  const [newListingPrice, setNewListingPrice] = useState('');
  const [newOwnerAddr, setNewOwnerAddr] = useState('');
  const [rescueTokenAddr, setRescueTokenAddr] = useState('');
  const [rescueTokenTo, setRescueTokenTo] = useState('');
  const [rescueTokenAmount, setRescueTokenAmount] = useState('');
  const [rescueEthTo, setRescueEthTo] = useState('');
  const [rescueEthAmount, setRescueEthAmount] = useState('');
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [txError, setTxError] = useState('');
  const [loading, setLoading] = useState(null);

  const loadData = useCallback(async () => {
    if (!readContract) return;
    try {
      const [ownerAddr, isPaused, price] = await Promise.all([
        readContract.getOwner(),
        readContract.paused(),
        readContract.getListingPrice(),
      ]);
      setOwner(ownerAddr);
      setIsOwner(address?.toLowerCase() === ownerAddr.toLowerCase());
      setPaused(isPaused);
      setListingPrice(ethers.utils.formatEther(price));
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  }, [readContract, address]);

  useEffect(() => { loadData(); }, [loadData]);

  const execTx = async (label, fn) => {
    try {
      setLoading(label);
      setTxStatus('pending');
      const tx = await fn();
      await tx.wait();
      setTxHash(tx.hash);
      setTxStatus('success');
      loadData();
    } catch (err) {
      setTxError(err.reason || err.message || 'Error');
      setTxStatus('error');
    } finally {
      setLoading(null);
    }
  };

  if (!address) {
    return (
      <Main><Container>
        <Alert severity="info">Connect your wallet to access the admin panel.</Alert>
      </Container></Main>
    );
  }

  if (!isOwner) {
    return (
      <Main><Container>
        <Alert severity="error">Access restricted to marketplace owner.</Alert>
      </Container></Main>
    );
  }

  return (
    <Main>
      <Container>
        <Typography variant="h4" sx={{ mb: 3 }}>Admin Panel</Typography>
        <TransactionStatus status={txStatus} hash={txHash} error={txError} onClose={() => { setTxStatus(null); setTxHash(''); setTxError(''); }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" gutterBottom>Status</Typography>
              <Box display="flex" gap={2} alignItems="center" mb={2}>
                <Typography>Marketplace:</Typography>
                <Chip label={paused ? 'Paused' : 'Active'} color={paused ? 'error' : 'success'} size="small" />
              </Box>
              <Button variant="contained" color={paused ? 'success' : 'error'} onClick={() => execTx('pause', () => paused ? writeContract.unpause() : writeContract.pause())} disabled={loading === 'pause'}>
                {loading === 'pause' ? <CircularProgress size={20} /> : paused ? 'Resume' : 'Pause'}
              </Button>
            </CardContent></Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" gutterBottom>Listing Fee</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>Current: {listingPrice} POL</Typography>
              <Box display="flex" gap={1} alignItems="flex-start">
                <TextField label="New fee (POL)" size="small" value={newListingPrice} onChange={(e) => setNewListingPrice(e.target.value)} sx={{ flex: 1 }} />
                <Button variant="contained" onClick={() => { const p = ethers.utils.parseEther(newListingPrice); execTx('listingPrice', () => writeContract.updateListingPrice(p)); }} disabled={loading === 'listingPrice' || !newListingPrice} sx={{ minHeight: 40 }}>
                  Update
                </Button>
              </Box>
            </CardContent></Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" gutterBottom>Ownership</Typography>
              <Typography variant="body2" color="text.secondary" mb={2} sx={{ wordBreak: 'break-all' }}>Owner: {owner}</Typography>
              <Box display="flex" gap={1} alignItems="flex-start">
                <TextField label="New owner address" size="small" fullWidth value={newOwnerAddr} onChange={(e) => setNewOwnerAddr(e.target.value)} />
                <Button variant="contained" onClick={() => execTx('transfer', () => writeContract.transferOwnership(newOwnerAddr))} disabled={loading === 'transfer' || !newOwnerAddr} sx={{ minHeight: 40, whiteSpace: 'nowrap' }}>
                  Transfer
                </Button>
              </Box>
            </CardContent></Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" gutterBottom>Accept Ownership</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>If you were designated as the new owner, click to accept.</Typography>
              <Button variant="contained" onClick={() => execTx('accept', () => writeContract.acceptOwnership())} disabled={loading === 'accept'}>
                Accept Ownership
              </Button>
            </CardContent></Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" gutterBottom>Rescue ERC20</Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <TextField label="Token address" size="small" value={rescueTokenAddr} onChange={(e) => setRescueTokenAddr(e.target.value)} />
                <TextField label="Recipient" size="small" value={rescueTokenTo} onChange={(e) => setRescueTokenTo(e.target.value)} />
                <TextField label="Amount" size="small" value={rescueTokenAmount} onChange={(e) => setRescueTokenAmount(e.target.value)} />
                <Button variant="contained" onClick={() => execTx('rescueERC20', () => writeContract.rescueERC20(rescueTokenAddr, rescueTokenTo, ethers.utils.parseEther(rescueTokenAmount)))} disabled={loading === 'rescueERC20'}>
                  Rescue
                </Button>
              </Box>
            </CardContent></Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" gutterBottom>Rescue POL</Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <TextField label="Recipient" size="small" value={rescueEthTo} onChange={(e) => setRescueEthTo(e.target.value)} />
                <TextField label="Amount (POL)" size="small" value={rescueEthAmount} onChange={(e) => setRescueEthAmount(e.target.value)} />
                <Button variant="contained" onClick={() => execTx('rescueETH', () => writeContract.rescueETH(rescueEthTo, ethers.utils.parseEther(rescueEthAmount)))} disabled={loading === 'rescueETH'}>
                  Rescue
                </Button>
              </Box>
            </CardContent></Card>
          </Grid>
        </Grid>
      </Container>
    </Main>
  );
}
