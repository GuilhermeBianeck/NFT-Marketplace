import React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

import Main from 'layouts/Main';
import Container from 'components/Container';
import Hero from 'components/Hero';
import PortfolioGrid from 'components/PortfolioGrid';
import Contact from 'components/Contact';
import WaveDivider from 'components/WaveDivider';
import useNFTLoader from 'hooks/useNFTLoader';
import { useWallet } from 'web3/WalletContext';

const Assets = () => {
  const theme = useTheme();
  const { web3Provider } = useWallet();
  const { nfts, loaded, error, reload } = useNFTLoader('fetchMyNFTs', {
    signer: web3Provider ? web3Provider.getSigner() : null,
    autoLoad: !!web3Provider,
  });

  return (
    <Main>
      <Container>
        <Hero
          title={
            loaded && !nfts.length
              ? 'You Don\'t Own Any Assets Yet'
              : 'Preserve, Care and Monitor through NFTs.'
          }
        />
      </Container>
      {!web3Provider && (
        <Container paddingY={'0 !important'}>
          <Alert severity="info">Connect your wallet to view your assets.</Alert>
        </Container>
      )}
      {error && (
        <Container paddingY={'0 !important'}>
          <Alert severity="error">{error}</Alert>
        </Container>
      )}
      {web3Provider && !loaded && !error && (
        <Container paddingY={'0 !important'}>
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        </Container>
      )}
      {loaded && nfts.length > 0 && (
        <Container paddingY={'0 !important'}>
          <PortfolioGrid data={nfts} showResell={true} onRefresh={reload} />
        </Container>
      )}
      {loaded && nfts.length === 0 && web3Provider && !error && (
        <Container paddingY={'0 !important'}>
          <Box textAlign="center" py={4}>
            <Box display="flex" gap={2} justifyContent="center" mt={2}>
              <Button variant="contained" href="/allNfts">Browse Biomes</Button>
              <Button variant="outlined" href="/create">Create a Biome</Button>
            </Box>
          </Box>
        </Container>
      )}
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

export default Assets;
