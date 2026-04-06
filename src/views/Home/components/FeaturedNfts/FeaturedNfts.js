import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const FeaturedNfts = () => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'), { defaultMatches: true });

  return (
    <Box>
      <Box marginBottom={4}>
        <Typography
          sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 1 }}
          gutterBottom
          color="secondary"
          align="center"
          variant="overline"
        >
          Featured Biomes
        </Typography>
        <Typography
          variant="h4"
          align="center"
          data-aos="fade-up"
          gutterBottom
        >
          Explore the Best Biomes
        </Typography>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretched', sm: 'flex-start' }}
          justifyContent="center"
          marginTop={2}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth={!isMd}
            href="/allNfts"
            endIcon={<ArrowForwardIcon />}
          >
            View All
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default FeaturedNfts;
