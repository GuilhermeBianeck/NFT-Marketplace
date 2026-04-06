import { alpha } from '@mui/material/styles';

const shadows = (themeMode = 'light') => {
  const rgb = themeMode === 'light' ? '#1b4332' : '#000000';

  return [
    'none',
    `0 1px 3px 0 ${alpha(rgb, 0.08)}, 0 1px 2px -1px ${alpha(rgb, 0.08)}`,
    `0 4px 6px -1px ${alpha(rgb, 0.08)}, 0 2px 4px -2px ${alpha(rgb, 0.06)}`,
    `0 10px 15px -3px ${alpha(rgb, 0.08)}, 0 4px 6px -4px ${alpha(rgb, 0.06)}`,
    `0 20px 25px -5px ${alpha(rgb, 0.1)}, 0 8px 10px -6px ${alpha(rgb, 0.06)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.15)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.18)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
    `0 25px 50px -12px ${alpha(rgb, 0.2)}`,
  ];
};

export default shadows;
