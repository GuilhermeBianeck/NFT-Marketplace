import React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

import Main from 'layouts/Main';
import Container from 'components/Container';
import Contact from 'components/Contact';
import WaveDivider from 'components/WaveDivider';
import Hero from './components/Hero';
import FeaturedNfts from './components/FeaturedNfts';
import useNFTLoader from 'hooks/useNFTLoader';

const Home = () => {
  const theme = useTheme();
  const { nfts, loaded, error } = useNFTLoader('fetchMarketItems');

  return (
    <Main>
      <Container>
        <Hero />
      </Container>
      {!loaded && !error && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Container paddingY={'0 !important'}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Unable to load biomes. Please check your connection and try again.
          </Alert>
        </Container>
      )}
      {loaded && nfts.length > 0 && (
        <Container>
          <FeaturedNfts />
        </Container>
      )}
      {loaded && nfts.length === 0 && !error && (
        <Container>
          <Box textAlign="center" py={4}>
            <Alert severity="info" sx={{ mb: 2 }}>
              No biomes listed yet. Be the first to create one!
            </Alert>
            <Button variant="contained" href="/create">
              Create a Biome
            </Button>
          </Box>
        </Container>
      )}
      <Box
        position={'relative'}
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

export default Home;
