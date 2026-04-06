import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';

const NavItem = ({ items }) => {
  const theme = useTheme();
  const router = useRouter();
  const activeLink = router.pathname;

  return (
    <Box>
      {items.map((p) => (
        <Button
          component={'a'}
          href={p.href}
          key={p.href}
          sx={{
            marginLeft: 4,
            justifyContent: 'flex-start',
            color:
              activeLink === p.href
                ? theme.palette.primary.main
                : theme.palette.text.primary,
            backgroundColor:
              activeLink === p.href
                ? alpha(theme.palette.primary.main, 0.1)
                : 'transparent',
            fontWeight: activeLink === p.href ? 700 : 500,
          }}
        >
          {p.title}
          {p.isNew && (
            <Box
              padding={0.5}
              display={'inline-flex'}
              borderRadius={1}
              bgcolor={'primary.main'}
              marginLeft={2}
            >
              <Typography
                variant={'caption'}
                sx={{ color: 'common.white', lineHeight: 1 }}
              >
                new
              </Typography>
            </Box>
          )}
        </Button>
      ))}
    </Box>
  );
};

NavItem.propTypes = {
  items: PropTypes.array.isRequired,
};

export default NavItem;
