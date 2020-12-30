<i18n lang="yaml">
en:
  login: "Login"

es:
  login: "Ingresar"

</i18n>

<template>
  <div>
    <q-btn
      v-if="!connected"
      :color="color"
      :text-color="textColor"
      @click="connect"
      >{{ $t('login') }}</q-btn
    >
  </div>
</template>

<script>
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
// import Portis from '@portis/web3';
// import Authereum from 'authereum';
// import UniLogin from '@unilogin/provider';

export default {
  name: 'Web3Modal',
  props: {
    color: {
      type: String,
      default: 'primary'
    },
    textColor: {
      type: String,
      default: 'white'
    }
  },
  data() {
    return {
      web3Modal: {},
      connected: false
    };
  },
  created() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          rpc: {
            1: 'https://eth-mainnet.gateway.pokt.network/v1/5f7648aab90218002e9ce993',
            3: 'https://eth-ropsten.gateway.pokt.network/v1/5f7648aab90218002e9ce993',
            4: 'https://eth-rinkeby.gateway.pokt.network/v1/5f7648aab90218002e9ce993',
            5: 'https://eth-goerli.gateway.pokt.network/v1/5f7648aab90218002e9ce993',
            42: 'https://poa-kovan.gateway.pokt.network/v1/5f7648aab90218002e9ce993',
            100: 'https://dai.poa.network',
            31337: 'http://localhost:8545'
          }
        }
      }

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
        this.$web3.instance.eth.getAccounts().then(accounts => {
          const [coinbase] = accounts;
          this.$emit('accountChanged', { coinbase });
        });
      }
    },
    chainChanged() {
      if (this.$web3.instance) {
        this.$web3.instance.eth.getChainId().then(chain => {
          this.$emit('chainChanged', { chain });
        });
      }
    },
    logout() {
      this.web3Modal.clearCachedProvider();
      this.$emit('accountChanged', { coinbase: null });
      this.$emit('chainChanged', { chain: null });
      this.connected = false;
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
