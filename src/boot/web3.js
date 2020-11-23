import Vue from 'vue';
import Web3 from 'web3';
import ENS from 'ethereum-ens';

const mainnetProvider = new Web3.providers.HttpProvider(
  'https://eth-mainnet.gateway.pokt.network/v1/5f7648aab90218002e9ce993'
);

const ens = new ENS(mainnetProvider);

Vue.prototype.$web3 = { instance: null, ens };
