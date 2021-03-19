<i18n lang="yaml">
en:
  uNFTWallet: "uNFT Wallet"
  betaWarning: "This is experimental software, use at your own risk"
  logout: "Disconnect"
  chatDiscord: "Connect on Discord"
  collaborateGitlab: "Collaborate on Gitlab"

es:
  uNFTWallet: "uNFT Wallet"
  betaWarning: "Esto es software experimental, use bajo su propio riesgo"
  logout: "Desconectar"
  chatDiscord: "Conectar en Discord"
  collaborateGitlab: "Colabora en Gitlab"

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

        <ChainChip v-if="connected" :chain-id="chain" :chains="$web3.chains" />
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
      <div class="q-pa-sm">
        <LanguageChanger :languages="languages" />
        <q-toggle
          v-model="darkEnabled"
          checked-icon="dark_mode"
          label="Dark Mode"
          unchecked-icon="brightness_low"
        />
        <q-list>
          <q-separator />
          <q-item
            v-ripple
            clickable
            tag="a"
            target="_blank"
            href="https://discord.gg/cVEPe333Fu"
          >
            <q-item-section avatar>
              <q-icon name="fab fa-discord" />
            </q-item-section>
            <q-item-section> {{ $t('chatDiscord') }} </q-item-section>
          </q-item>
          <q-item
            v-ripple
            clickable
            tag="a"
            target="_blank"
            href="https://gitlab.com/ktl_xv/unft-wallet"
          >
            <q-item-section avatar>
              <q-icon name="fab fa-gitlab" />
            </q-item-section>
            <q-item-section>
              {{ $t('collaborateGitlab') }}
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
</template>

<script>
import Blockie from '../components/Blockie';
import Web3Modal from '../components/Web3Modal';
import LanguageChanger from '../components/LanguageChanger';
import ChainChip from '../components/ChainChip';

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
    },
    $route(to) {
      if (window.goatcounter) {
        window.goatcounter.count({
          path: to.fullPath
        });
      }
    }
  },
  mounted() {
    const goatCount = document.createElement('script');
    goatCount.setAttribute(
      'data-goatcounter',
      'https://unftwallet.goatcounter.com/count'
    );
    goatCount.setAttribute(
      'data-goatcounter-settings',
      '{ no_onload: true, allow_local: true }'
    );
    goatCount.setAttribute('src', '//gc.zgo.at/count.js');
    document.head.appendChild(goatCount);
  },
  created() {
    if (window.localStorage.getItem('darkEnabled') === 'true') {
      this.$q.dark.set(true);
    }
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
    }
  }
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
