import { boot } from 'quasar/wrappers';
import Web3 from 'web3';
import ENS, { getEnsAddress } from '@ensdomains/ensjs';

const mainnetProvider = new Web3.providers.HttpProvider(
  'https://public-eth-node.poap.tech/a4515e04d575d29ec59024e3a2e4089f85bcb9ad',
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
    mainnetProvider,
  };
});
