import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import Main from 'layouts/Main';
import Container from 'components/Container';
import Hero from 'components/Hero';
import Contact from 'components/Contact';
import { CardContent, Typography, Card, Link } from '@mui/material';
import CardMedia from '@mui/material/CardMedia';
import LinkIcon from '@mui/icons-material/Link';
import { ethers } from 'ethers';
import Marketplace from 'contracts/Marketplace.sol/Marketplace.json';
import axios from 'axios';
import ItemCard from './components/ItemCard';
import Chart from './components/Chart';
import { SpaceBar } from '@mui/icons-material';

export default function DevicesItem({ tokenId }) {
  const theme = useTheme();
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const POLLING_INTERVAL = 5000; // Poll every 5 seconds

const getData = async (deviceUID) => {
  if (!deviceUID) return;
  try {
    const result = await axios.get(
      `https://www.bioma.cloud/api/devices?deviceUid=${deviceUID}&limit=10000`
    );
    setData(result.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

  async function loadNFTs() {
    if (!tokenId) return;
    setLoading(true);
    const provider = new ethers.providers.JsonRpcProvider(
      'https://rpc.cardona.zkevm-rpc.com/',
    );
    const marketContract = new ethers.Contract(
      process.env.MARKETPLACE_ADDRESS,
      Marketplace.abi,
      provider,
    );

    const tokenUri = await marketContract.tokenURI(String(tokenId));
    const meta = await axios.get(tokenUri);

    if (meta.data.deviceUID) {
      getData(meta.data.deviceUID);
    }

    const item = {
      tokenId,
      image: meta.data.image,
      name: meta.data.name,
      description: meta.data.description,
      address: meta.data.address,
      deviceUID: meta.data.deviceUID,
    };
    setNft(item);
    setLoading(false);
  }

  useEffect(() => {
    loadNFTs();
  }, [tokenId]);

  // Polling Effect: Start polling for new data if deviceUID exists
  useEffect(() => {
    if (nft?.deviceUID) {
      getData(nft.deviceUID); // Fetch initial data
      const interval = setInterval(() => getData(nft.deviceUID), POLLING_INTERVAL);
      return () => clearInterval(interval); // Clear interval on component unmount
    }
  }, [nft?.deviceUID]);

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
        <ItemCard nft={nft} />
        <div style={{ height: 20 }} />
        <Chart deviceUID={nft?.deviceUID} data={data || []} />
      </Container>
      <Box
        position={'relative'}
        marginTop={{ xs: 4, md: 6 }}
        sx={{
          backgroundColor: theme.palette.alternate.main,
        }}
      >
        <Box
          component={'svg'}
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 1920 100.1"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: 'translateY(-50%)',
            zIndex: 2,
            width: 1,
          }}
        >
          <path
            fill={theme.palette.alternate.main}
            d="M0,0c0,0,934.4,93.4,1920,0v100.1H0L0,0z"
          ></path>
        </Box>
        <Container>
          <Contact />
        </Container>
      </Box>
    </Main>
  );
}