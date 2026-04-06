import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

import Main from 'layouts/Main';
import Container from 'components/Container';
import Contact from 'components/Contact';
import WaveDivider from 'components/WaveDivider';
import { ethers } from 'ethers';
import Marketplace from 'contracts/Marketplace.sol/Marketplace.json';
import axios from 'axios';
import ItemCard from './components/ItemCard';
import Chart from './components/Chart';
import { RPC_URL, MARKETPLACE_ADDRESS, POLLING_INTERVAL } from 'constants';

export default function DevicesItem({ tokenId }) {
  const theme = useTheme();
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(false);
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
      console.error('Error fetching data:', err);
    }
  }, []);

  const loadNFTs = useCallback(async () => {
    if (!tokenId) return;
    setLoading(true);
    setError(null);
    try {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const marketContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        Marketplace.abi,
        provider,
      );

      const tokenUri = await marketContract.tokenURI(String(tokenId));
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
      });
    } catch (err) {
      console.error('Error loading NFT:', err);
      setError(err.message || 'Erro ao carregar NFT');
    } finally {
      setLoading(false);
    }
  }, [tokenId, getData]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  useEffect(() => {
    if (!nft?.deviceUID) return;
    getData(nft.deviceUID);
    const interval = setInterval(() => getData(nft.deviceUID), POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [nft?.deviceUID, getData]);

  return (
    <Main>
      <Container paddingY={'0 !important'}>
        <Typography
          variant={'h6'}
          align={'left'}
          sx={{ fontWeight: 700, marginBottom: 2 }}
        >
          Dashboard
        </Typography>
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}
        <ItemCard nft={nft} />
        <Box sx={{ height: 20 }} />
        <Chart deviceUID={nft?.deviceUID} data={data || []} />
      </Container>
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
}
