import React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

import Main from 'layouts/Main';
import Container from 'components/Container';
import PortfolioGrid from 'components/PortfolioGrid';
import Contact from 'components/Contact';
import WaveDivider from 'components/WaveDivider';
import useNFTLoader from 'hooks/useNFTLoader';
import { useWallet } from 'web3/WalletContext';

const Listings = () => {
  const theme = useTheme();
  const { isConnected, signer } = useWallet();
  const { nfts, loaded, error, reload } = useNFTLoader('fetchItemsListed', {
    signer: signer || null,
    autoLoad: isConnected,
  });

  return (
    <Main>
      <Container>
        <Typography variant="h4" sx={{ mb: 2 }}>
          My Listings
        </Typography>
        {!isConnected && (
          <Alert severity="info">Connect your wallet to view your listings.</Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {isConnected && !loaded && !error && (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        )}
        {loaded && nfts.length === 0 && isConnected && (
          <Box textAlign="center" py={2}>
            <Alert severity="info" sx={{ mb: 2 }}>You don't have any items listed yet.</Alert>
            <Button variant="contained" href="/assets">Go to My Assets</Button>
          </Box>
        )}
        {loaded && nfts.length > 0 && (
          <PortfolioGrid data={nfts} showSellerActions={true} onRefresh={reload} />
        )}
      </Container>
      <Box
        position="relative"
        marginTop={{ xs: 4, md: 6 }}
        sx={{ backgroundColor: theme.palette.alternate.main }}
      >
        <WaveDivider />
        <Container>
          <Contact />
        </Container>
      </Box>
    </Main>
  );
};

export default Listings;
