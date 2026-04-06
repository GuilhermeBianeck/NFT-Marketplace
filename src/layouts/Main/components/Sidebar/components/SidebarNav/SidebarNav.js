import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import NavItem from './components/NavItem';
import Login from 'web3/Login';
import { LOGO_URL } from 'constants';

const SidebarNav = ({ pages }) => {
  return (
    <Box>
      <Box width={1} paddingX={2} paddingY={1}>
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
            height={1}
            width={1}
          />
        </Box>
      </Box>
      <Box paddingX={2} paddingY={2}>
        <Box>
          <NavItem items={pages} />
        </Box>
      </Box>
    </Box>
  );
};

SidebarNav.propTypes = {
  pages: PropTypes.array.isRequired,
};

export default SidebarNav;
