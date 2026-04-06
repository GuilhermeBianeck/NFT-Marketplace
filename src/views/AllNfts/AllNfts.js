import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

import Main from 'layouts/Main';
import Container from 'components/Container';
import Contact from 'components/Contact';
import PortfolioGrid from 'components/PortfolioGrid';
import WaveDivider from 'components/WaveDivider';
import useNFTLoader from 'hooks/useNFTLoader';
import useMarketplace from 'hooks/useMarketplace';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

const AllNfts = () => {
  const theme = useTheme();
  const { nfts, loaded, error, reload } = useNFTLoader('fetchMarketItems');
  const contract = useMarketplace();
  const [stats, setStats] = useState({ listed: 0, minted: 0 });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    if (!contract) return;
    async function loadStats() {
      try {
        const [listed, minted] = await Promise.all([
          contract.totalItemsListed(),
          contract.totalItemsMinted(),
        ]);
        setStats({ listed: listed.toNumber(), minted: minted.toNumber() });
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    }
    loadStats();
  }, [contract]);

  const filteredNfts = nfts
    .filter((nft) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        nft.name?.toLowerCase().includes(q) ||
        nft.description?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === 'price-low') return parseFloat(a.price) - parseFloat(b.price);
      if (sort === 'price-high') return parseFloat(b.price) - parseFloat(a.price);
      return b.tokenId - a.tokenId;
    });

  return (
    <Main>
      <Container>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Typography variant="h4">
            All Biomes
          </Typography>
          <Box display="flex" gap={1}>
            <Chip label={`${stats.listed} listed`} color="primary" variant="outlined" />
            <Chip label={`${stats.minted} created`} color="secondary" variant="outlined" />
          </Box>
        </Box>

        <Box display="flex" gap={2} mb={3} flexDirection={{ xs: 'column', sm: 'row' }}>
          <TextField
            placeholder="Search biomes..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: { sm: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            {SORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!loaded && !error && (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        )}
        {loaded && filteredNfts.length > 0 && (
          <PortfolioGrid data={filteredNfts} buttonShow={true} onRefresh={reload} />
        )}
        {loaded && filteredNfts.length === 0 && !error && (
          <Box textAlign="center" py={4}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {search ? 'No biomes match your search.' : 'No biomes available at the moment.'}
            </Alert>
            {!search && (
              <Button variant="contained" href="/create">Create the First Biome</Button>
            )}
          </Box>
        )}
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
};

export default AllNfts;
