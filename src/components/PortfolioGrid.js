import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CardMedia from '@mui/material/CardMedia';
import LinkIcon from '@mui/icons-material/Link';
import Link from '@mui/material/Link';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SellIcon from '@mui/icons-material/Sell';
import LockIcon from '@mui/icons-material/Lock';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';

import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useWallet } from 'web3/WalletContext';
import useMarketplace from 'hooks/useMarketplace';
import TransactionStatus from 'components/TransactionStatus';

const PortfolioGrid = ({ data = [], buttonShow, onRefresh, showSellerActions, showResell }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const { address } = useWallet();
  const contract = useMarketplace({ requireSigner: true });

  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [txError, setTxError] = useState('');
  const [loading, setLoading] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItem, setMenuItem] = useState(null);

  const [priceDialog, setPriceDialog] = useState(false);
  const [priceTarget, setPriceTarget] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  const [resellDialog, setResellDialog] = useState(false);
  const [resellTarget, setResellTarget] = useState(null);
  const [resellPrice, setResellPrice] = useState('');

  const resetTx = () => { setTxStatus(null); setTxHash(''); setTxError(''); };

  const execTx = useCallback(async (label, fn) => {
    try {
      setLoading(label);
      setTxStatus('pending');
      const tx = await fn();
      await tx.wait();
      setTxHash(tx.hash);
      setTxStatus('success');
      if (onRefresh) onRefresh();
    } catch (err) {
      const msg = err.code === 'ACTION_REJECTED'
        ? 'Transaction was rejected.'
        : 'Something went wrong. Please try again.';
      setTxError(msg);
      setTxStatus('error');
    } finally {
      setLoading(null);
    }
  }, [onRefresh]);

  const handleBuy = useCallback((item) => {
    const price = ethers.utils.parseUnits(item.price.toString(), 'ether');
    execTx('buy', () => contract.createMarketSale(item.tokenId, { value: price }));
  }, [contract, execTx]);

  const handleCancel = useCallback((item) => {
    execTx('cancel', () => contract.cancelListing(item.tokenId));
  }, [contract, execTx]);

  const handleUpdatePrice = useCallback(() => {
    if (!priceTarget || !newPrice) return;
    const price = ethers.utils.parseUnits(newPrice, 'ether');
    execTx('updatePrice', () => contract.updateItemPrice(priceTarget.tokenId, price));
    setPriceDialog(false);
  }, [contract, execTx, priceTarget, newPrice]);

  const handleResell = useCallback(async () => {
    if (!resellTarget || !resellPrice) return;
    const price = ethers.utils.parseUnits(resellPrice, 'ether');
    const listingPrice = await contract.getListingPrice();
    execTx('resell', () => contract.resellToken(resellTarget.tokenId, price, { value: listingPrice }));
    setResellDialog(false);
  }, [contract, execTx, resellTarget, resellPrice]);

  const handleFreeze = useCallback((item) => {
    execTx('freeze', () => contract.freezeTokenURI(item.tokenId));
  }, [contract, execTx]);

  const isSeller = (item) => address && item.seller?.toLowerCase() === address.toLowerCase();
  const isOwner = (item) => address && item.owner?.toLowerCase() === address.toLowerCase();

  const openMenu = (event, item) => { setMenuAnchor(event.currentTarget); setMenuItem(item); };
  const closeMenu = () => { setMenuAnchor(null); setMenuItem(null); };

  return (
    <Box>
      <TransactionStatus status={txStatus} hash={txHash} error={txError} onClose={resetTx} />
      <Grid container spacing={4}>
        {data.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.tokenId}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardMedia
                title={item.name}
                image={item.image}
                sx={{
                  position: 'relative',
                  paddingTop: '75%',
                  overflow: 'hidden',
                  backgroundColor: 'background.level2',
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  position="absolute"
                  bottom={0}
                  padding={1.5}
                  width={1}
                >
                  <Chip
                    label={`${item.price} POL`}
                    size="small"
                    sx={{
                      bgcolor: 'background.paper',
                      fontWeight: 700,
                      boxShadow: 1,
                    }}
                  />
                  {item.frozen && (
                    <Chip icon={<LockIcon />} label="Frozen" size="small" color="info" />
                  )}
                </Box>
              </CardMedia>
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                  {item.description}
                </Typography>
                {item.address && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <LinkIcon sx={{ width: 14, height: 14 }} />
                    <Link href={item.address} underline="hover" variant="caption" color="text.secondary">
                      View link
                    </Link>
                  </Box>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Button size="small" onClick={() => router.push(`/biome/${item.tokenId}`)}>
                  Details
                </Button>
                <Box display="flex" gap={0.5} alignItems="center">
                  {/* Buy */}
                  {buttonShow && !isSeller(item) && (
                    isMd ? (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleBuy(item)}
                        disabled={!!loading}
                        startIcon={loading === 'buy' ? <CircularProgress size={14} /> : <ShoppingBagIcon />}
                      >
                        Buy
                      </Button>
                    ) : (
                      <Tooltip title="Buy">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleBuy(item)}
                          disabled={!!loading}
                          aria-label="Buy"
                          sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}
                        >
                          {loading === 'buy' ? <CircularProgress size={14} color="inherit" /> : <ShoppingBagIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    )
                  )}

                  {/* Resell */}
                  {showResell && isOwner(item) && item.sold && (
                    isMd ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={() => { setResellTarget(item); setResellPrice(''); setResellDialog(true); }}
                        startIcon={<SellIcon />}
                      >
                        Resell
                      </Button>
                    ) : (
                      <Tooltip title="Resell">
                        <IconButton
                          size="small"
                          onClick={() => { setResellTarget(item); setResellPrice(''); setResellDialog(true); }}
                          aria-label="Resell"
                          sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', '&:hover': { bgcolor: 'secondary.dark' } }}
                        >
                          <SellIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  )}

                  {/* Seller actions: overflow menu on mobile, buttons on desktop */}
                  {showSellerActions && isSeller(item) && (
                    isMd ? (
                      <>
                        <Tooltip title="Cancel listing">
                          <IconButton size="small" color="error" onClick={() => handleCancel(item)} disabled={!!loading}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update price">
                          <IconButton size="small" onClick={() => { setPriceTarget(item); setNewPrice(item.price); setPriceDialog(true); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!item.frozen && (
                          <Tooltip title="Freeze metadata">
                            <IconButton size="small" onClick={() => handleFreeze(item)} disabled={!!loading}>
                              <LockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    ) : (
                      <>
                        <IconButton size="small" onClick={(e) => openMenu(e, item)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </>
                    )
                  )}
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mobile overflow menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={() => { handleCancel(menuItem); closeMenu(); }}>
          <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Cancel Listing</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setPriceTarget(menuItem); setNewPrice(menuItem?.price); setPriceDialog(true); closeMenu(); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Update Price</ListItemText>
        </MenuItem>
        {menuItem && !menuItem.frozen && (
          <MenuItem onClick={() => { handleFreeze(menuItem); closeMenu(); }}>
            <ListItemIcon><LockIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Freeze Metadata</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Update Price Dialog */}
      <Dialog open={priceDialog} onClose={() => setPriceDialog(false)} aria-labelledby="price-dialog-title">
        <DialogTitle id="price-dialog-title">Update Price</DialogTitle>
        <DialogContent>
          <TextField label="New price (POL)" fullWidth value={newPrice} onChange={(e) => setNewPrice(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdatePrice}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Resell Dialog */}
      <Dialog open={resellDialog} onClose={() => setResellDialog(false)} aria-labelledby="resell-dialog-title">
        <DialogTitle id="resell-dialog-title">Resell NFT</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A listing fee will be charged.
          </Typography>
          <TextField label="Sale price (POL)" fullWidth value={resellPrice} onChange={(e) => setResellPrice(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResellDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleResell}>List for Sale</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

PortfolioGrid.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  buttonShow: PropTypes.bool,
  onRefresh: PropTypes.func,
  showSellerActions: PropTypes.bool,
  showResell: PropTypes.bool,
};

export default PortfolioGrid;
