<i18n lang="yaml">
en:
  uNFTWallet: "uNFT Wallet"
  logout: "Logout"

es:
  uNFTWallet: "uNFT Wallet"
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

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-1">
      <LanguageChanger :languages="languages" />
      <q-list>
        <q-item-label header class="text-grey-8"> </q-item-label>
      </q-list>
    </q-drawer>

    <q-page-container>
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
