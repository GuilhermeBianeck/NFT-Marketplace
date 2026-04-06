import React from 'react';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

const TransactionStatus = ({ status, hash, error, onClose }) => {
  if (!status) return null;

  if (status === 'pending') {
    return (
      <Alert severity="info" sx={{ mb: 2 }} icon={<CircularProgress size={20} />}>
        Transaction in progress...
      </Alert>
    );
  }

  if (status === 'success') {
    return (
      <Alert severity="success" sx={{ mb: 2 }} onClose={onClose}>
        <Typography variant="body2">Transaction confirmed!</Typography>
        {hash && (
          <Link
            href={`https://polygonscan.com/tx/${hash}`}
            target="_blank"
            rel="noopener"
            variant="caption"
          >
            View on Polygonscan
          </Link>
        )}
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert severity="error" sx={{ mb: 2 }} onClose={onClose}>
        {error || 'Transaction failed'}
      </Alert>
    );
  }

  return null;
};

export default TransactionStatus;
