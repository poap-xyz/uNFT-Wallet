<i18n lang="yaml">
en:
  uNFTWallet: "uNFT Wallet"
  betaWarning: "This is experimental software, use at your own risk"
  logout: "Logout"

es:
  uNFTWallet: "uNFT Wallet"
  betaWarning: "Este es software experimental, use bajo su propio riesgo"
  logout: "Salir"

</i18n>

<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          {{ $t('uNFTWallet') }}
        </q-toolbar-title>
        <Web3Modal
          ref="web3modal"
          color="accent"
          @accountChanged="accountChanged"
          @chainChanged="chainChanged"
        />

        <ChainChip v-if="connected" :chain-id="chain" />
        <q-btn v-if="connected" round flat>
          <Blockie :address="coinbase"></Blockie>
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item v-close-popup clickable>
                <q-item-section>
                  {{ coinbase }}
                </q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click="logout">
                <q-item-section>{{ $t('logout') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      :class="darkEnabled ? '' : 'bg-light'"
    >
      <LanguageChanger :languages="languages" />
      <q-list>
        <q-toggle
          v-model="darkEnabled"
          checked-icon="dark_mode"
          label="Dark Mode"
          unchecked-icon="brightness_low"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <div class="center">
        <q-chip>{{ $t('betaWarning') }}</q-chip>
      </div>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import Blockie from '../components/Blockie.vue';
import Web3Modal from '../components/Web3Modal.vue';
import LanguageChanger from '../components/LanguageChanger.vue';
import ChainChip from '../components/ChainChip.vue';

export default {
  name: 'MainLayout',
  components: { Blockie, Web3Modal, LanguageChanger, ChainChip },
  data() {
    return {
      leftDrawerOpen: false
    };
  },
  computed: {
    languages() {
      return this.$i18n.availableLocales.map(code => code.toUpperCase());
    },
    connected() {
      return this.coinbase !== null && this.chain !== null;
    },
    coinbase() {
      return this.$store.state.web3.coinbase;
    },
    chain() {
      return this.$store.state.web3.chainId;
    },
    darkEnabled: {
      get() {
        return this.$q.dark.isActive;
      },
      set() {
        this.$q.dark.toggle();
        window.localStorage.setItem('darkEnabled', this.$q.dark.isActive);
        return this.$q.dark.isActive;
      }
    }
  },
  watch: {
    connected(newValue, oldValue) {
      if (newValue && !oldValue) {
        this.$router.push({ name: 'main' });
      } else if (!newValue && oldValue) {
        this.$router.push({ name: 'welcome' });
      }
    }
  },
  created() {
    if (window.localStorage.getItem('darkEnabled') === 'true') {
      this.$q.dark.set(true);
    }
  },
  methods: {
    accountChanged(e) {
      this.$store.commit('web3/SET_COINBASE', e.coinbase);
      /*
      if (e.coinbase) {
        this.$store.commit(
          'web3/SET_COINBASE',
          '0xa44aad4cf0fb0d4940c6cf215977c9cd55340f42'
        );
      } else {
        this.$store.commit('web3/SET_COINBASE', null);
      }
    */
    },
    chainChanged(e) {
      this.$store.commit('web3/SET_CHAIN_ID', e.chain);
    },
    logout() {
      this.$refs.web3modal.logout();
    }
  }
};
</script>

<style lang="scss">
.center {
  text-align: center;
}
body.body--light {
  background-color: #f5f6f4;
  --q-color-primary: #567b75;
  --q-color-secondary: #ffd685;
  --q-color-accent: #20525a;
  --q-color-positive: #559649;
  --q-color-negative: #a03c38;
  --q-color-info: var(--q-color-primary);
  --q-color-warning: #f6c856;
}
body.body--dark {
  background-color: #041011;
  --q-color-primary: #273835;
  --q-color-secondary: #0e2529;
  --q-color-accent: #ae7400;
  --q-color-dark: #092324;
  --q-color-positive: #135f25;
  --q-color-negative: #8d343e;
  --q-color-info: var(--q-color-primary);
  --q-color-warning: var(--q-color-accent);
}
</style>
