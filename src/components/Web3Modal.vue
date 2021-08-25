<i18n lang="yaml">
en:
  connectWallet: 'Connect Wallet'

es:
  connectWallet: 'Conectar Wallet'
</i18n>

<template>
  <div>
    <q-btn
      v-if="!connected"
      :color="color"
      :text-color="textColor"
      @click="connect"
      >{{ $t('connectWallet') }}</q-btn
    >
  </div>
</template>

<script>
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';

// import Portis from '@portis/web3';
// import Authereum from 'authereum';
// import UniLogin from '@unilogin/provider';

export default {
  name: 'Web3Modal',
  props: {
    color: {
      type: String,
      default: 'primary',
    },
    textColor: {
      type: String,
      default: 'white',
    },
  },
  emits: ['accountChanged', 'chainChanged'],
  data() {
    return {
      web3Modal: {},
      connected: false,
    };
  },
  watch: {
    '$q.dark.isActive': async function (newVal) {
      await this.web3Modal.updateTheme(newVal ? 'dark' : 'light');
    },
  },
  created() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          rpc: {
            1: 'https://eth-mainnet.alchemyapi.io/v2/2pT9LJbbjuBhaVTmaQoE3wyIWJcHotYU',
            3: 'https://eth-ropsten.alchemyapi.io/v2/AkNG6siuaC2LDNxNzsc9BkUm0m9VOXqt',
            4: 'https://eth-rinkeby.alchemyapi.io/v2/PVG3Cru0vP_9TCEnM73qXuqkNxlEkdf4',
            5: 'https://eth-goerli.alchemyapi.io/v2/CE7523yco5hm0ZbSyBDQK6gGnYYD79nj',
            42: 'https://eth-kovan.alchemyapi.io/v2/rdvmCipeQJZw2p_oTdgp3ELyueWmlrVz',
            56: 'https://bsc-dataseed.binance.org/',
            77: 'https://sokol.poa.network',
            97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
            100: 'https://dai.poa.network',
            137: 'https://rpc-endpoints.superfluid.dev/matic',
            250: 'https://rpcapi.fantom.network/',
            4002: 'https://rpc.testnet.fantom.network/',
            31337: 'http://localhost:8545',
            80001: 'https://rpc-endpoints.superfluid.dev/mumbai',
          },
        },
      },

      /* portis: {
        package: Portis, // required
        options: {
          id: 'c99ad65f-e89e-4b13-b6b3-13998f9d3639', // required
          network: {
            nodeUrl: 'http://localhost:8545',
            chainId: '31337'
            // nodeUrl: 'https://testnet.19930528.xyz',
            // chainId: '20066'
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
      } */
    };

    this.web3Modal = new Web3Modal({
      cacheProvider: true,
      disableInjectedProvider: false,
      theme: this.$q.dark.isActive ? 'dark' : 'light',
      providerOptions,
    });
    if (this.web3Modal.cachedProvider) {
      this.connect();
    }
  },
  methods: {
    async connect() {
      const provider = await this.web3Modal.connect();

      // Subscribe to accounts change
      provider.on('accountsChanged', this.accountChanged);

      // Subscribe to chainId change
      provider.on('chainChanged', this.chainChanged);

      // Subscribe to provider connection
      provider.on('connect', () => {
        this.accountChanged();
        this.chainChanged();
        this.connected = true;
      });

      // Subscribe to provider disconnection
      provider.on('disconnect', () => {
        this.logout();
      });

      provider.autoRefreshOnNetworkChange = false;
      this.$web3.instance = new Web3(provider);
      this.chainChanged();
      this.accountChanged();
      this.connected = true;
    },
    accountChanged() {
      if (this.$web3.instance) {
        this.$web3.instance.eth.getAccounts().then((accounts) => {
          const [coinbase] = accounts;
          this.$emit('accountChanged', { coinbase });
        });
      }
    },
    chainChanged() {
      if (this.$web3.instance) {
        this.$web3.instance.eth.getChainId().then((chain) => {
          this.$emit('chainChanged', { chain });
        });
      }
    },
    logout() {
      if (
        window.localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER') ===
        '"walletconnect"'
      ) {
        window.localStorage.removeItem('walletconnect');
      }
      this.web3Modal.clearCachedProvider();
      this.$emit('accountChanged', { coinbase: null });
      this.$emit('chainChanged', { chain: null });
      this.connected = false;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.voucher-card img {
  max-width: 200px;
  max-height: 200px;
}
</style>
