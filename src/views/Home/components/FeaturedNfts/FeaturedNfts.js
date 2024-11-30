import React, { useState } from 'react'; 
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';


const FeaturedNfts = ({ data = [] }) => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'), { defaultMatches: true });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState({});
  
  const showFeaturedNfts = false; // Change to true to display the slider

  const handleSensorClick = (sensorDetails) => {
    setSelectedSensor(sensorDetails);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const sliderOpts = {
    dots: true,
    arrows: false,
    infinite: true,
    slidesToShow: isMd ? 3 : 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  return (
    <Box>
      <Box marginBottom={4}>
        <Typography
          sx={{
            textTransform: 'uppercase',
            fontWeight: 'medium',
          }}
          gutterBottom
          color={'secondary'}
          align={'center'}
        >
          Biomas de Destaque
        </Typography>
        <Typography
          variant="h4"
          align={'center'}
          data-aos={'fade-up'}
          gutterBottom
          sx={{
            fontWeight: 700,
          }}
        >
          Veja os Melhores Biomas
        </Typography>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretched', sm: 'flex-start' }}
          justifyContent={'center'}
          marginTop={2}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth={isMd ? false : true}
            href="/allNfts"
            endIcon={
              <Box
                component={'svg'}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                width={24}
                height={24}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </Box>
            }
          >
            Ver Todos
          </Button>
        </Box>
      </Box>
      {/* Conditionally render the slider */}
      {showFeaturedNfts && (
        <Box maxWidth={{ xs: 420, sm: 620, md: 1 }} margin={'0 auto'}>
          <Slider {...sliderOpts}>
            {data.map((item, i) => (
              <Box key={i} padding={{ xs: 1, md: 2, lg: 3 }}>
                <Box
                  display={'block'}
                  width={1}
                  height={1}
                  sx={{
                    textDecoration: 'none',
                    transition: 'all .2s ease-in-out',
                    '&:hover': {
                      transform: `translateY(-${theme.spacing(1 / 2)})`,
                    },
                  }}
                >
                  <Box
                    component={Card}
                    width={1}
                    height={1}
                    display={'flex'}
                    flexDirection={'column'}
                    sx={{ backgroundImage: 'none' }}
                  >
                    <CardMedia
                      title={item.name}
                      image={item.image}
                      sx={{
                        position: 'relative',
                        height: { xs: 240, sm: 340, md: 280 },
                        overflow: 'hidden',
                      }}
                    />
                    <CardContent>
                      <Typography
                        variant={'h6'}
                        gutterBottom
                        align={'left'}
                        sx={{ fontWeight: 700 }}
                      >
                        {item.name}
                      </Typography>
                      <Box marginTop={2} display={'flex'} alignItems={'center'}>
                        <Typography variant={'subtitle1'} color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </CardContent>
                    <Box flexGrow={1} />
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <Button>Link para NFT</Button>
                      {item.sensorDetails && (
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleSensorClick(item.sensorDetails)}
                        >
                          Detalhes do Sensor
                        </Button>
                      )}
                    </CardActions>
                  </Box>
                </Box>
              </Box>
            ))}
          </Slider>
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogContent>
              <DialogContentText>
                {selectedSensor && (
                  <>
                    Sensor: {selectedSensor.name || 'N/A'}
                    <br />
                    Type: {selectedSensor.type || 'N/A'}
                  </>
                )}
              </DialogContentText>
            </DialogContent>
            {selectedSensor && (selectedSensor.name || selectedSensor.type) && (
              <DialogActions>
                <Button onClick={handleCloseDialog} color="primary">
                  Fechar
                </Button>
              </DialogActions>
            )}
          </Dialog>
        </Box>
      )}
    </Box>
  );
};