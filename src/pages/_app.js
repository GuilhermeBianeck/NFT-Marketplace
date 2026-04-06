import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Page from '../components/Page';
import ErrorBoundary from '../components/ErrorBoundary';

import 'react-lazy-load-image-component/src/effects/blur.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'react-image-lightbox/style.css';
import 'aos/dist/aos.css';

function Web3ProviderWrapper({ children }) {
  const [Provider, setProvider] = useState(null);

  useEffect(() => {
    import('../web3/Web3Providers').then((mod) => {
      setProvider(() => mod.default);
    });
  }, []);

  if (!Provider) return <>{children}</>;
  return <Provider>{children}</Provider>;
}

export default function App({ Component, pageProps }) {
  return (
    <React.Fragment>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>Bioma</title>
      </Head>
      <Web3ProviderWrapper>
        <Page>
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
        </Page>
      </Web3ProviderWrapper>
    </React.Fragment>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
