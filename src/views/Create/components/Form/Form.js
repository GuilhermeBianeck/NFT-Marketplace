import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Grid,
  IconButton,
  Collapse,
  Alert,
  Typography,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import DialogBox from 'components/DialogBox';
import FormField from 'components/FormField';

import { ethers } from 'ethers';
import { useWallet } from 'web3/WalletContext';
import useMarketplace from 'hooks/useMarketplace';

const validationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Name too short')
    .max(50, 'Name too long')
    .required('Enter a name'),
  description: yup
    .string()
    .trim()
    .max(1000, 'Must be under 1,000 characters')
    .required('Please write a description'),
  price: yup
    .string()
    .min(0, 'Price must be at least 0')
    .required('Enter the NFT price'),
  address: yup
    .string()
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      'Enter a valid URL',
    ),
  deviceUID: yup.string().trim().required('Device UID is required'),
  sensorType: yup.string().trim().required('Sensor Type is required'),
});

const Form = () => {
  const { address, isConnected } = useWallet();
  const writeContract = useMarketplace({ requireSigner: true });

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: '',
      address: '',
      deviceUID: '',
      sensorType: '',
    },
    validationSchema,
    onSubmit: () => {
      setLoading(true);
      setFormError('');
      createMarket();
    },
  });

  const [open, setOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [dialogBoxOpen, setDialogBoxOpen] = useState(false);
  const [hash, setHash] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef(null);

  const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT || '';
  const pinataGateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

  async function uploadToPinata(fileOrData, isJson = false) {
    const formData = new FormData();
    if (isJson) {
      const blob = new Blob([fileOrData], { type: 'application/json' });
      formData.append('file', blob, 'metadata.json');
    } else {
      formData.append('file', fileOrData);
    }

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${pinataJwt}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.details || err.error || 'Upload failed');
    }

    const data = await res.json();
    return `${pinataGateway}/ipfs/${data.IpfsHash}`;
  }

  async function createSale(url) {
    if (!fileUrl) {
      setAlertOpen(true);
      setLoading(false);
      return;
    }
    if (!writeContract || !address) {
      setFormError('Please connect your wallet first.');
      setLoading(false);
      return;
    }
    try {
      const price = ethers.utils.parseEther(formik.values.price);
      const listingPrice = (await writeContract.getListingPrice()).toString();
      const royaltyFee = 500;
      const transaction = await writeContract.createToken(url, price, address, royaltyFee, { value: listingPrice });

      await transaction.wait();
      setHash(transaction.hash);
      setDialogBoxOpen(true);
    } catch (error) {
      console.error('Error creating NFT:', error);
      if (error.code === 'ACTION_REJECTED') {
        setFormError('Transaction was rejected.');
      } else {
        setFormError('Failed to create NFT. Please try again.');
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setAlertOpen(false);
      formik.resetForm();
      setFileUrl('');
      setOpen(false);
      setLoading(false);
    }
  }

  async function processFile(file) {
    if (!file) return;
    try {
      setFormError('');
      const url = await uploadToPinata(file);
      setFileUrl(url);
      setOpen(true);
    } catch (error) {
      console.error('Error uploading file:', error);
      setFormError('File upload failed: ' + error.message);
      setLoading(false);
      setOpen(false);
    }
  }

  async function createMarket() {
    const { name, description, price, address: link, deviceUID, sensorType } = formik.values;
    if (!name || !description || !price) {
      setFormError('Please fill in all required fields.');
      setLoading(false);
      return;
    }
    if (!fileUrl) {
      setFormError('Please upload a file first.');
      setAlertOpen(true);
      setLoading(false);
      return;
    }
    if (!isConnected) {
      setFormError('Please connect your wallet first.');
      setLoading(false);
      return;
    }
    try {
      const metadata = JSON.stringify({ name, description, address: link, image: fileUrl, deviceUID, sensorType });
      const url = await uploadToPinata(metadata, true);
      await createSale(url);
    } catch (error) {
      console.error('Error uploading metadata:', error);
      setFormError('Failed to upload metadata: ' + error.message);
      setLoading(false);
    }
  }

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragIn = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragOut = (e) => { e.preventDefault(); setDragActive(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  return (
    <Box>
      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Connect your wallet to create a Biome NFT.
        </Alert>
      )}
      {formError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError('')}>
          {formError}
        </Alert>
      )}
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }} fontWeight={700}>
              Upload File *
            </Typography>
            <Box
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed',
                borderColor: dragActive ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: dragActive ? 'action.hover' : 'background.level2',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {fileUrl ? 'File uploaded successfully' : 'Drag & drop or click to upload'}
              </Typography>
            </Box>
            <input
              type="file"
              name="file"
              onChange={(e) => processFile(e.target.files[0])}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <Collapse in={open}>
              <Alert severity="success" sx={{ mt: 1 }} action={
                <IconButton aria-label="Close" color="inherit" size="small" onClick={() => setOpen(false)}>
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }>
                File uploaded successfully!
              </Alert>
            </Collapse>
            <Collapse in={alertOpen}>
              <Alert severity="error" sx={{ mt: 1 }} action={
                <IconButton aria-label="Close" color="inherit" size="small" onClick={() => setAlertOpen(false)}>
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }>
                Please upload a file first.
              </Alert>
            </Collapse>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField label="NFT Name" name="name" formik={formik} label2="Biome Name *" />
          </Grid>
          <Grid item xs={12}>
            <FormField label="Description" name="description" formik={formik} label2="Description *" multiline rows={3} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField label="Price" name="price" formik={formik} label2="Biome Price (POL) *" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField label="Link" name="address" formik={formik} label2="Link to NFT (optional)" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField label="Device UID" name="deviceUID" formik={formik} label2="Device UID *" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField label="Sensor Type" name="sensorType" formik={formik} label2="Sensor Type *" />
          </Grid>
          <Grid item container xs={12}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretched', sm: 'center' }} justifyContent="space-between" width={1} margin="0 auto">
              <LoadingButton
                endIcon={<SendIcon />}
                size="large"
                variant="contained"
                type="submit"
                loading={loading}
                loadingPosition="end"
                disabled={!isConnected}
              >
                Create
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
      </form>
      <DialogBox
        open={dialogBoxOpen}
        onClose={() => setDialogBoxOpen(false)}
        title="Done!"
        message={`Your Biome NFT was created successfully. Hash: ${hash}`}
        buttonText="View on Polygonscan"
        buttonLink={`https://polygonscan.com/tx/${hash}`}
      />
    </Box>
  );
};

export default Form;
