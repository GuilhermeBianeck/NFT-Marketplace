import React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

const WaveDivider = () => {
  const theme = useTheme();
  const fillColor = theme.palette.alternate.main;

  return (
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
        fill={fillColor}
        d="M0,0c0,0,934.4,93.4,1920,0v100.1H0L0,0z"
      />
    </Box>
  );
};

export default WaveDivider;
