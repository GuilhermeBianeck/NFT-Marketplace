import { useEffect, useState } from 'react';
import { getEllipsisTxt } from 'utils/formatters';
import Blockie from 'utils/Blockie';
import Skeleton from '@mui/material/Skeleton';
import { useMoralis } from 'react-moralis';

const styles = {
  address: {
    height: '36px',
    display: 'flex',
    gap: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '9px',
    alignItems: 'center',
  },
};

const CopyIcon = ({ onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="26"
    height="26"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="#1780FF"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ cursor: 'pointer' }}
    onClick={onClick}
    role="button"
    aria-label="Copiar endereco"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M15 3v4a1 1 0 0 0 1 1h4" />
    <path d="M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2z" />
    <path d="M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2" />
    <title>Copiar endereco</title>
  </svg>
);

const CheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    strokeWidth="3"
    stroke="#21BF96"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Copiado"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 12l5 5l10 -10" />
    <title>Copiado!</title>
  </svg>
);

function Address({ address: addressProp, size, copyable, avatar, style }) {
  const { account, isAuthenticated } = useMoralis();
  const [address, setAddress] = useState('');
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    setAddress(addressProp || (isAuthenticated && account));
  }, [account, isAuthenticated, addressProp]);

  if (!address) return <Skeleton variant="text" />;

  return (
    <div style={{ ...styles.address, ...style }}>
      {avatar === 'left' && <Blockie address={address} size={7} />}
      <p>{size ? getEllipsisTxt(address, size) : address}</p>
      {avatar === 'right' && <Blockie address={address} size={7} />}
      {copyable &&
        (isClicked ? (
          <CheckIcon />
        ) : (
          <CopyIcon
            onClick={() => {
              navigator.clipboard.writeText(address);
              setIsClicked(true);
            }}
          />
        ))}
    </div>
  );
}

export default Address;
