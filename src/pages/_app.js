import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Page from '../components/Page';
import ErrorBoundary from '../components/ErrorBoundary';

import 'react-lazy-load-image-component/src/effects/blur.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'react-image-lightbox/style.css';
import 'aos/dist/aos.css';

const Web3Providers = dynamic(() => import('../web3/Web3Providers'), {
  ssr: false,
});

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
      <Web3Providers>
        <Page>
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
        </Page>
      </Web3Providers>
    </React.Fragment>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
