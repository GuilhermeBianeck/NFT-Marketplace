import React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
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
      {error && (
        <Container paddingY={'0 !important'}>
          <Alert severity="error">{error}</Alert>
        </Container>
      )}
      {loaded && nfts.length > 0 && (
        <Container>
          <FeaturedNfts />
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
