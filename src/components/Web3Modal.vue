<template>
  <div>
    <q-btn color="primary" text-color="white" @click="connect">{{
      $t('common.actions.login')
    }}</q-btn>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import Portis from '@portis/web3';
import Authereum from 'authereum';
import UniLogin from '@unilogin/provider';

export default {
  name: 'Web3Modal',
  data() {
    return {
      web3Modal: {},
      provider: {}
    };
  },
  computed: {
    ...mapState('web3', ['connected', 'coinbase'])
  },
  created() {
    this.$store.subscribe(mutation => {
      if (mutation.type === 'web3/SET_WANT_CHANGE_ACCOUNT') {
        this.web3Modal.clearCachedProvider();
        this.connect();
      }
    });

    this.$store.subscribe(mutation => {
      if (mutation.type === 'web3/SET_WANT_LOGOUT') {
        this.web3Modal.clearCachedProvider();
        this.$web3.instance.currentProvider.close();
      }
    });
    const providerOptions = {
      portis: {
        package: Portis, // required
        options: {
          id: 'c99ad65f-e89e-4b13-b6b3-13998f9d3639', // required
          network: {
            // nodeUrl: 'http://localhost:8545',
            // chainId: '31337',
            nodeUrl: 'https://testnet.19930528.xyz',
            chainId: '20066'
          },
          config: {
            registerPageByDefault: true
          }
        }
      },
      authereum: {
        package: Authereum // required
      },
      unilogin: {
        package: UniLogin // required
      }
    };

    this.web3Modal = new Web3Modal({
      cacheProvider: true, // optional
      disableInjectedProvider: false,
      providerOptions // required
    });
    if (this.web3Modal.cachedProvider) {
      this.connect();
    }
  },
  methods: {
    async connect() {
      const provider = await this.web3Modal.connect();

      // Subscribe to accounts change
      provider.on('accountsChanged', () => {
        this.$store.dispatch('web3/saveLogin');
      });

      // Subscribe to chainId change
      provider.on('chainChanged', () => {
        this.$store.dispatch('web3/saveLogin');
      });

      // Subscribe to provider connection
      provider.on('connect', () => {
        this.$store.dispatch('web3/saveLogin');
      });

      // Subscribe to provider disconnection
      provider.on('disconnect', () => {
        this.$store.dispatch('web3/logout');
      });

      provider.autoRefreshOnNetworkChange = false;
      this.$web3.instance = new Web3(provider);

      this.$store.dispatch('web3/saveLogin');
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.voucher-card img {
  max-width: 200px;
  max-height: 200px;
}
</style>
