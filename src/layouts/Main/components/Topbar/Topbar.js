import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { NavItem } from './components';
import ThemeModeToggler from 'components/ThemeModeToggler';
import Login from 'web3/Login';
import { LOGO_URL } from 'constants';

const Topbar = ({ onSidebarOpen, pages }) => {
  const theme = useTheme();

  return (
    <Box
      display={'flex'}
      justifyContent={'space-between'}
      alignItems={'center'}
      width={1}
      component="nav"
      aria-label="Navegacao principal"
    >
      <Box
        display={'flex'}
        component="a"
        href="/"
        title="Bioma"
        width={{ xs: 100, md: 120 }}
      >
        <Box
          component={'img'}
          src={LOGO_URL}
          alt="Bioma - Logo"
          height={0.5}
          width={0.5}
        />
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'flex' } }} alignItems={'center'}>
        <Box>
          <NavItem items={pages} />
        </Box>
        <Box marginLeft={4}>
          <Login />
        </Box>
        <Box marginLeft={4}>
          <ThemeModeToggler />
        </Box>
      </Box>
      <Box sx={{ display: { xs: 'flex', md: 'none' } }} alignItems={'center'}>
        <Box>
          <Login />
        </Box>
        <Box marginLeft={1}>
          <Button
            onClick={() => onSidebarOpen()}
            aria-label="Abrir menu"
            variant={'outlined'}
            sx={{
              borderRadius: 2,
              minWidth: 'auto',
              padding: 1,
              borderColor: alpha(theme.palette.divider, 0.2),
            }}
          >
            <MenuIcon />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

Topbar.propTypes = {
  onSidebarOpen: PropTypes.func,
  pages: PropTypes.array,
};

export default Topbar;
