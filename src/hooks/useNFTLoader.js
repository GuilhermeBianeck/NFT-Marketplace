import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import Marketplace from 'contracts/Marketplace.sol/Marketplace.json';
import { RPC_URL, MARKETPLACE_ADDRESS } from 'config';

export default function useNFTLoader(fetchMethod = 'fetchMarketItems', options = {}) {
  const { signer, autoLoad = true } = options;
  const [nfts, setNfts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const loadNFTs = useCallback(async () => {
    const address = MARKETPLACE_ADDRESS?.trim();
    if (!address || typeof window === 'undefined') {
      setLoaded(true);
      return;
    }
    try {
      setError(null);
      let provider;
      let marketContract;

      if (signer) {
        marketContract = new ethers.Contract(
          address,
          Marketplace.abi,
          signer,
        );
      } else {
        provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        marketContract = new ethers.Contract(
          address,
          Marketplace.abi,
          provider,
        );
      }

      // Use explicit signature for overloaded functions (ethers v5)
      const fn = marketContract[fetchMethod] || marketContract[`${fetchMethod}()`];
      const data = await fn();

      const items = await Promise.all(
        data.map(async (i) => {
          const tokenUri = await marketContract.tokenURI(i.tokenId);
          const meta = await axios.get(tokenUri);
          const price = ethers.utils.formatUnits(i.price.toString(), 'ether');
          return {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
            address: meta.data.address,
          };
        }),
      );

      setNfts(items);
      setLoaded(true);
    } catch (err) {
      console.error(`Error loading NFTs (${fetchMethod}):`, err);
      setError('Unable to load biomes. Please check your connection and try again.');
      setLoaded(true);
    }
  }, [fetchMethod, signer]);

  useEffect(() => {
    if (autoLoad) {
      loadNFTs();
    }
  }, [autoLoad, loadNFTs]);

  return { nfts, loaded, error, reload: loadNFTs };
}
