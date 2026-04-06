import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { LOGO_URL } from 'config';

const Footer = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width={1}
          flexDirection={{ xs: 'column', sm: 'row' }}
        >
          <Box display="flex" component="a" href="/" title="Bioma" width={110}>
            <Box component="img" src={LOGO_URL} alt="Bioma - Logo" height={1} width={1} />
          </Box>
          <Box display="flex" flexWrap="wrap" alignItems="center">
            <Box marginTop={1} marginRight={2}>
              <Link underline="none" component="a" href="/" color="text.primary" variant="subtitle2">
                Home
              </Link>
            </Box>
            <Box marginTop={1} marginRight={2}>
              <Link underline="none" component="a" href="/allNfts" color="text.primary" variant="subtitle2">
                Marketplace
              </Link>
            </Box>
            <Box marginTop={1}>
              <Link underline="none" component="a" href="#" color="text.primary" variant="subtitle2">
                Privacy
              </Link>
            </Box>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Typography align="center" variant="subtitle2" color="text.secondary" gutterBottom>
          &copy; Bioma. {new Date().getFullYear()}. MIT
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Footer;
