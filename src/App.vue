<i18n lang="yaml">
en:
  uNFTWallet: 'uNFT Wallet'
  betaWarning: 'This is experimental software, use at your own risk'
  logout: 'Disconnect'
  collaborateGithub: 'Collaborate on Github'
  donate: 'Donate'
  donationAccount: 'Thank you very much for supporting uNFT Wallet. If you want to donate you may send a transfer to 0x1018fd8686acA67DcB9D71168c2D1fF45a820417 or, better yet, you can buy an NFT (and show it off) with the red heart button inside the app.'
  donationOtherWays: 'Other awesome ways to support the project are connecting on Discord, coding, reporting issues, and/or translating on Github and spreading the word.'
  donationClose: 'Again, thank you very much for your support.'

es:
  uNFTWallet: 'uNFT Wallet'
  betaWarning: 'Esto es software experimental, use bajo su propio riesgo'
  logout: 'Desconectar'
  collaborateGithub: 'Colabora en Github'
  donate: 'Donar'
  donationAccount: 'Muchisimas gracias por apoyar a uNFT Wallet. Si gustas donar, puedes enviar una transferencia a 0x1018fd8686acA67DcB9D71168c2D1fF45a820417 o, mejor todavía, puedes comprar un NFT (y presumirlo) con el botón rojo con un corazón que está dentro de la aplicación.'
  donationOtherWays: 'Otras geniales maneras de apoyar el proyecto son comentando tu experiencia en Discord, programando, reportando problemas y/o traduciendo en Github y compartiendo uNFT Wallet con mas personas.'
  donationClose: 'De nuevo, muchas gracias por tu apoyo.'
</i18n>

<template>
  <div>
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

          <q-toolbar-title @click="goHome()">
            {{ $t('uNFTWallet') }}
          </q-toolbar-title>
          <Web3ModalWrapper
            ref="web3modal"
            color="accent"
            @account-changed="accountChanged"
            @chain-changed="chainChanged"
          />
          <ChainChip
            v-if="connected"
            :chain-id="chain"
            :chains="$web3.chains"
          />
          <q-btn v-if="connected" round flat>
            <MetaAvatar :address="coinbase">
              <Web3Blockie :address="coinbase"></Web3Blockie>
            </MetaAvatar>
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
        <div class="q-pa-sm">
          <LanguageChanger :languages="languages" />
          <q-toggle
            v-model="darkEnabled"
            checked-icon="dark_mode"
            label="Dark Mode"
            unchecked-icon="brightness_low"
          />
          <q-toggle
            v-model="multichainModeEnabled"
            checked-icon="link"
            label="Multichain Mode"
            unchecked-icon="link_off"
          />
          <q-list>
            <q-separator />
            <q-item
              v-ripple
              clickable
              tag="a"
              target="_blank"
              href="https://github.com/poap-xyz/unft-wallet"
            >
              <q-item-section avatar>
                <q-icon name="fab fa-github" />
              </q-item-section>
              <q-item-section>
                {{ $t('collaborateGithub') }}
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-drawer>

      <q-page-container>
        <div class="center">
          <q-chip class="disclaimer">{{ $t('betaWarning') }}</q-chip>
        </div>
        <router-view />
      </q-page-container>
    </q-layout>
    <q-dialog v-model="showDonateModal">
      <q-card>
        <q-toolbar>
          <q-toolbar-title>{{ $t('donate') }}</q-toolbar-title>

          <q-btn v-close-popup flat round dense icon="close" />
        </q-toolbar>

        <q-card-section>
          <p>
            {{ $t('donationAccount') }}
          </p>
          <p>
            {{ $t('donationOtherWays') }}
          </p>
          <p>
            {{ $t('donationClose') }}
          </p>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { setCssVar } from 'quasar';
import Web3Blockie from './components/Web3Blockie';
import Web3ModalWrapper from './components/Web3ModalWrapper';
import LanguageChanger from './components/LanguageChanger';
import ChainChip from './components/ChainChip';
import MetaAvatar from './components/MetaAvatar';

function setLightMode() {
  setCssVar('primary', '#567b75');
  setCssVar('secondary', '#ffd685');
  setCssVar('accent', '#20525a');
  setCssVar('positive', '#559649');
  setCssVar('negative', '#a03c38');
  setCssVar('info', 'var(--q-primary)');
  setCssVar('warning', '#f6c856');
}

function setDarkMode() {
  setCssVar('primary', '#273835');
  setCssVar('secondary', '#0e2529');
  setCssVar('accent', '#ae7400');
  setCssVar('positive', '#135f25');
  setCssVar('negative', '#8d343e');
  setCssVar('info', 'var(--q-primary)');
  setCssVar('warning', 'var(--q-accent)');
}

export default {
  name: 'App',
  components: {
    Web3Blockie,
    Web3ModalWrapper,
    LanguageChanger,
    ChainChip,
    MetaAvatar,
  },
  data() {
    return {
      leftDrawerOpen: false,
      showDonateModal: false,
      multichainModeEnabled: null,
    };
  },
  computed: {
    languages() {
      return this.$i18n.availableLocales.map((code) => code.toUpperCase());
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
        if (this.$q.dark.isActive) {
          setDarkMode();
        } else {
          setLightMode();
        }
        window.localStorage.setItem('darkEnabled', this.$q.dark.isActive);
        return this.$q.dark.isActive;
      },
    },
  },
  watch: {
    connected(newValue, oldValue) {
      if (this.$router.name !== 'single') {
        if (newValue && !oldValue) {
          this.$router.push({ name: 'main-page' });
        } else if (!newValue && oldValue) {
          this.$router.replace({ name: 'welcome-page' });
        }
      }
    },
    $route(to) {
      if (window.goatcounter) {
        window.goatcounter.count({
          path: to.fullPath,
        });
      }
    },
    multichainModeEnabled(newValue) {
      window.localStorage.setItem('multichainModeEnabled', newValue);
      this.$store.commit('ui/SET_MULTICHAIN_MODE', newValue);
    },
  },
  mounted() {
    const goatCount = document.createElement('script');
    goatCount.setAttribute(
      'data-goatcounter',
      'https://unftwallet.goatcounter.com/count'
    );
    goatCount.setAttribute(
      'data-goatcounter-settings',
      '{ "no_onload": true, "allow_local": true }'
    );
    goatCount.setAttribute('src', '//gc.zgo.at/count.js');
    document.head.appendChild(goatCount);

    if (this.$q.dark.isActive) {
      setDarkMode();
    } else {
      setLightMode();
    }
  },
  created() {
    if (window.localStorage.getItem('darkEnabled') === 'true') {
      this.$q.dark.set(true);
    }

    let multichainModeEnableConf = true;
    if (window.localStorage.getItem('multichainModeEnabled') === 'false') {
      multichainModeEnableConf = false;
    }
    this.multichainModeEnabled = multichainModeEnableConf;
    this.$store.commit('multichainMode', multichainModeEnableConf);
  },
  methods: {
    accountChanged(e) {
      this.$store.commit('web3/SET_COINBASE', e.coinbase);
    },
    chainChanged(e) {
      this.$store.commit('web3/SET_CHAIN_ID', e.chain);
    },
    logout() {
      this.$refs.web3modal.logout();
    },
    goHome() {
      this.$router.push('/');
    },
  },
};
</script>

<style lang="scss">
.center {
  text-align: center;
}
.disclaimer {
  margin-bottom: 0;
  margin-top: 10px;
}
body.body--light {
  background-color: #f5f6f4;
}
body.body--dark {
  background-color: #041011;
}
</style>
