import React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { HERO_IMAGE_URL } from 'config';

const Hero = () => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  });

  return (
    <Box
      padding={{ xs: 3, md: 5 }}
      borderRadius={3}
      sx={{
        background:
          theme.palette.mode === 'light'
            ? `linear-gradient(135deg, ${theme.palette.alternate.main} 0%, ${theme.palette.background.default} 100%)`
            : `linear-gradient(135deg, ${theme.palette.alternate.main} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Grid container spacing={4}>
        <Grid
          item
          container
          xs={12}
          md={6}
          alignItems={'center'}
          sx={{ position: 'relative' }}
        >
          <Box data-aos={isMd ? 'fade-right' : 'fade-up'} marginBottom={4}>
            <Box marginBottom={2}>
              <Typography
                variant="h3"
                component="h1"
                sx={{ fontWeight: 800, lineHeight: 1.2 }}
              >
                Care, Preserve and Monitor Biomes through NFTs and IoT
              </Typography>
            </Box>
            <Typography
              variant="h6"
              component="p"
              color="text.secondary"
              sx={{ fontWeight: 400 }}
            >
              A platform for environmental preservation powered by blockchain technology.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box height={1} width={1} display="flex" justifyContent="center">
            <Box height={1} width={1} maxWidth={{ xs: 600, md: '100%' }} maxHeight={500}>
              <Box
                component="img"
                src={HERO_IMAGE_URL}
                alt="Bioma Cloud platform illustration for biome preservation"
                width={1}
                height={1}
                sx={{
                  filter: theme.palette.mode === 'dark' ? 'brightness(0.8)' : 'none',
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Hero;
