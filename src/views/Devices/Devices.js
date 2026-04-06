import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';

import Main from 'layouts/Main';
import Container from 'components/Container';
import Contact from 'components/Contact';
import WaveDivider from 'components/WaveDivider';
import { ethers } from 'ethers';
import Marketplace from 'contracts/Marketplace.sol/Marketplace.json';
import axios from 'axios';
import ItemCard from './components/ItemCard';
import Chart from './components/Chart';
import { RPC_URL, MARKETPLACE_ADDRESS, POLLING_INTERVAL } from 'config';

export default function BiomeDetail({ tokenId }) {
  const theme = useTheme();
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  const getData = useCallback(async (deviceUID) => {
    if (!deviceUID) return;
    try {
      const result = await axios.get(
        `https://www.bioma.cloud/api/devices?deviceUid=${deviceUID}&limit=10000`,
      );
      setData(result.data);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
    }
  }, []);

  const loadNFT = useCallback(async () => {
    const addr = MARKETPLACE_ADDRESS?.trim();
    if (!tokenId || !addr) return;
    setLoading(true);
    setError(null);
    try {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(addr, Marketplace.abi, provider);

      // Fetch on-chain data and metadata in parallel
      const [tokenUri, marketItem] = await Promise.all([
        contract.tokenURI(String(tokenId)),
        contract.getMarketItem(tokenId).catch(() => null),
      ]);

      const meta = await axios.get(tokenUri);

      if (meta.data.deviceUID) {
        getData(meta.data.deviceUID);
      }

      setNft({
        tokenId,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        address: meta.data.address,
        deviceUID: meta.data.deviceUID,
        sensorType: meta.data.sensorType,
        price: marketItem ? ethers.utils.formatEther(marketItem.price) : null,
        seller: marketItem?.seller,
        owner: marketItem?.owner,
        sold: marketItem?.sold,
      });
    } catch (err) {
      console.error('Error loading biome:', err);
      setError('Unable to load biome data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [tokenId, getData]);

  useEffect(() => {
    loadNFT();
  }, [loadNFT]);

  useEffect(() => {
    if (!nft?.deviceUID) return;
    const interval = setInterval(() => getData(nft.deviceUID), POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [nft?.deviceUID, getData]);

  return (
    <Main>
      <Container>
        {loading && (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        {nft && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
              <Typography variant="h4">
                {nft.name}
              </Typography>
              <Box display="flex" gap={1}>
                {nft.price && (
                  <Chip label={`${nft.price} POL`} color="primary" />
                )}
                {nft.deviceUID && (
                  <Chip label={nft.sensorType || 'Sensor'} variant="outlined" size="small" />
                )}
              </Box>
            </Box>
            <ItemCard nft={nft} />
            <Box sx={{ height: 24 }} />
            {data.length > 0 ? (
              <Chart deviceUID={nft.deviceUID} data={data} />
            ) : (
              !loading && nft.deviceUID && (
                <Alert severity="info" sx={{ mb: 2 }}>No sensor data available for this device yet.</Alert>
              )
            )}
          </>
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
}
