import { responsiveFontSizes } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import shadows from './shadows';
import { light, dark } from './palette';

const getTheme = (mode, themeToggler) =>
  responsiveFontSizes(
    createTheme({
      palette: mode === 'light' ? light : dark,
      shadows: shadows(mode),
      typography: {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        h1: { fontWeight: 800 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 500 },
        subtitle2: { fontWeight: 500 },
        button: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      shape: {
        borderRadius: 8,
      },
      zIndex: {
        appBar: 1200,
        drawer: 1300,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            '@media (prefers-reduced-motion: reduce)': {
              '*, *::before, *::after': {
                animationDuration: '0.01ms !important',
                animationIterationCount: '1 !important',
                transitionDuration: '0.01ms !important',
              },
            },
            ':focus-visible': {
              outline: `2px solid ${mode === 'light' ? '#1b4332' : '#4caf50'}`,
              outlineOffset: '2px',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              fontWeight: 600,
              borderRadius: 8,
              paddingTop: 10,
              paddingBottom: 10,
              transition: 'all 0.2s ease',
            },
            contained: {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                transform: 'translateY(-1px)',
              },
            },
            containedSecondary: mode === 'light' ? { color: '#fff' } : {},
          },
        },
        MuiInputBase: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
            input: {
              borderRadius: 8,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              border:
                mode === 'light'
                  ? '1px solid rgba(0, 0, 0, 0.06)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              transition: 'all 0.25s ease',
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 12,
            },
          },
        },
      },
      themeToggler,
    }),
  );

export default getTheme;
