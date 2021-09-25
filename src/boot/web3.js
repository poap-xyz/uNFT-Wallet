import { boot } from 'quasar/wrappers';
import Web3 from 'web3';
import ENS, { getEnsAddress } from '@ensdomains/ensjs';

const mainnetProvider = new Web3.providers.HttpProvider(
  'https://eth-mainnet.gateway.pokt.network/v1/5f7648aab90218002e9ce993'
);

const ens = new ENS({
  provider: mainnetProvider,
  ensAddress: getEnsAddress('1'),
});

import chains from '../blockchains.json';
import donations from '../donations.json';

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  // eslint-disable-next-line no-param-reassign
  app.config.globalProperties.$web3 = {
    instance: null,
    ens,
    chains,
    donations,
  };
});
