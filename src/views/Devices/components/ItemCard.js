import React from 'react';
import Box from '@mui/material/Box';
import { CardContent, Typography, Card, Link } from '@mui/material';
import CardMedia from '@mui/material/CardMedia';
import LinkIcon from '@mui/icons-material/Link';


export default function ItemCard({ nft }) {
  return (
    <Box display={'block'} width={1} height={1}>
      <Box
        component={Card}
        width={1}
        height={1}
        display={'flex'}
        flexDirection={'column'}
      >
        <CardMedia
          title={nft?.name}
          image={nft?.image}
          sx={{
            position: 'relative',
            height: { xs: 240, sm: 340, md: 280 },
            overflow: 'hidden',
          }}
        >
          <Box
            display={'flex'}
            justifyContent={'space-between'}
            position={'absolute'}
            bottom={0}
            padding={2}
            width={1}
          >
            <Box
              padding={1}
              bgcolor={'background.paper'}
              boxShadow={1}
              borderRadius={2}
            >
              <Typography sx={{ fontWeight: 600 }}>
                {nft?.price} POL
              </Typography>
            </Box>
          </Box>
        </CardMedia>
        <CardContent>
          <Typography variant={'h6'} align={'left'} sx={{ fontWeight: 700 }}>
            {nft?.name}
          </Typography>
          <Box display={'flex'} alignItems={'center'} marginY={2}>
            <Typography variant={'subtitle2'} color="text.secondary">
              {nft?.description}
            </Typography>
          </Box>
          <Box display={'flex'} alignItems={'center'} gap={0.5}>
            <LinkIcon sx={{ width: 16, height: 16, color: 'text.secondary' }} />
            <Link href={nft?.address} underline="hover" variant="subtitle2" color="text.secondary">
              Link to NFT
            </Link>
          </Box>
        </CardContent>
      </Box>
    </Box>
  );
}
