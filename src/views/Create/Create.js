import React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import Main from 'layouts/Main';
import Container from 'components/Container';
import Hero from 'components/Hero';
import Contact from 'components/Contact';
import WaveDivider from 'components/WaveDivider';
import { Form } from './components';

export default function CreateItem() {
  const theme = useTheme();

  return (
    <Main>
      <Container>
        <Hero title="Care and Preserve Through NFTs." />
      </Container>
      <Container paddingY={'0 !important'}>
        <Form />
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
}
