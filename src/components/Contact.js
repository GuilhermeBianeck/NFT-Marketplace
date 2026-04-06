import React from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Contact = () => {
  return (
    <Box>
      <Box marginBottom={4}>
        <Typography variant="h4" align="center" gutterBottom>
          Subscribe to our Newsletter
        </Typography>
        <Typography
          variant="h6"
          component="p"
          color="text.secondary"
          align="center"
        >
          Get the latest news and updates.
        </Typography>
      </Box>
      <Box maxWidth={600} margin="0 auto">
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{
            '& .MuiInputBase-input.MuiOutlinedInput-input': {
              bgcolor: 'background.paper',
            },
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'center', md: 'flex-start' }}
            justifyContent="center"
            gap={2}
          >
            <TextField
              label="Enter your email"
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ maxWidth: 422 }}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ minHeight: 56 }}
            >
              Subscribe
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Contact;
