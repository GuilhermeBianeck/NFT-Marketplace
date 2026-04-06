import React from 'react';
import PropTypes from 'prop-types';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

const NFTCard = ({ item, direction = 'column', theme }) => (
  <Card
    elevation={0}
    sx={{
      p: { xs: 2, sm: 4 },
      height: 1,
      display: 'flex',
      flexDirection: { xs: 'column', sm: direction === 'column' ? 'column' : direction },
      alignItems: direction === 'column' ? undefined : 'center',
      justifyContent: direction === 'column' ? 'center' : undefined,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
      },
    }}
  >
    <Box sx={{ p: 4, mb: 2 }}>
      <Box
        component={LazyLoadImage}
        effect="blur"
        src={item.image}
        alt={item.name || 'NFT image'}
        width={1}
        maxWidth={1}
        sx={{
          filter: theme.palette.mode === 'dark' ? 'brightness(0.7)' : 'none',
        }}
      />
    </Box>
    <Box>
      <Typography
        color="primary"
        fontWeight={700}
        variant="caption"
        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
      >
        {item.price} POL
      </Typography>
      <Typography variant="h5" marginY={1}>
        {item.name}
      </Typography>
      <Typography color="text.secondary">{item.description}</Typography>
    </Box>
  </Card>
);

const HomeGrid = ({ data = [] }) => {
  const theme = useTheme();
  if (data.length === 0) return null;

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
          Popular Biomes
        </Typography>
        <Typography variant="h4" align="center" data-aos="fade-up" gutterBottom>
          Explore our Popular Biomes
        </Typography>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          {data[0] && <NFTCard item={data[0]} direction="column" theme={theme} />}
        </Grid>
        <Grid item xs={12} md={7}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              {data[3] && <NFTCard item={data[3]} direction="row-reverse" theme={theme} />}
            </Grid>
            <Grid item xs={12}>
              {data[2] && <NFTCard item={data[2]} direction="row" theme={theme} />}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

HomeGrid.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
};

export default HomeGrid;
