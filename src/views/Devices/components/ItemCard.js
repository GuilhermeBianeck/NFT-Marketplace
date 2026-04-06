import React from 'react';
import Box from '@mui/material/Box';
import { CardContent, Typography, Card, Link, Chip } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import DevicesIcon from '@mui/icons-material/Sensors';

export default function ItemCard({ nft }) {
  if (!nft) return null;

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: '40%' },
          minHeight: { xs: 250, md: 350 },
          position: 'relative',
          bgcolor: 'background.level2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {nft.image ? (
          <Box
            component="img"
            src={nft.image}
            alt={nft.name || 'Biome image'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        ) : (
          <Typography color="text.secondary">No image</Typography>
        )}
      </Box>
      <CardContent sx={{ flex: 1, p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {nft.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {nft.description}
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          {nft.price && (
            <Chip label={`${nft.price} POL`} color="primary" size="small" />
          )}
          {nft.deviceUID && (
            <Chip
              icon={<DevicesIcon />}
              label={`Device: ${nft.deviceUID}`}
              variant="outlined"
              size="small"
            />
          )}
          {nft.sold !== undefined && (
            <Chip
              label={nft.sold ? 'Sold' : 'For Sale'}
              color={nft.sold ? 'default' : 'success'}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
        {nft.address && nft.address.length > 0 && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <LinkIcon sx={{ width: 16, height: 16, color: 'text.secondary' }} />
            <Link href={nft.address} underline="hover" variant="body2" color="text.secondary" target="_blank" rel="noopener">
              External Link
            </Link>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
