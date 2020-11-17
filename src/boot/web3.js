import Vue from 'vue';
import Web3 from 'web3';
import ENS from 'ethereum-ens';

const web3 = new Web3(window.ethereum || 'https://testnet.19930528.xyz');
const provider = new Web3.providers.HttpProvider(
  'https://eth-mainnet.gateway.pokt.network/v1/5f7648aab90218002e9ce993'
);
const ens = new ENS(provider);

Vue.prototype.$web3 = {instance: web3, ens};
