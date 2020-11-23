<i18n lang="yaml">
en:
  tooltip: "Connected to {chainName}"

es:
  tooltip: "Conectado a {chainName}"
</i18n>
<template>
  <q-chip v-if="chainShow" :icon="chainIcon" :color="chainColor">
    {{ chainName }}
    <q-tooltip>{{ $t('tooltip', { chainName }) }}</q-tooltip>
  </q-chip>
</template>

<script>
const chains = {
  1: {
    name: 'Mainnet',
    status: 'error'
  },
  3: {
    name: 'Ropsten',
    status: 'error'
  },
  4: {
    name: 'Rinkeby',
    status: 'error'
  },
  5: {
    name: 'Goreli',
    status: 'error'
  },
  42: {
    name: 'Kovan',
    status: 'error'
  },
  77: {
    name: 'Sokol',
    status: 'warn'
  },
  100: {
    name: 'xDAI',
    status: 'ok'
  },
  1234: {
    name: 'Localhost',
    status: 'warn'
  },
  20066: {
    name: 'TestNet',
    status: 'warn'
  },
  31337: {
    name: 'Localhost',
    status: 'warn'
  }
};

const colors = {
  ok: 'positive',
  warn: 'warning',
  error: 'negative'
};

const icons = {
  ok: 'fas fa-link',
  warn: 'fas fa-exclamation-triangle',
  error: 'fas fa-times'
};

export default {
  name: 'ChainChip',
  props: {
    chainId: {
      type: Number,
      required: true
    }
  },
  computed: {
    chainName() {
      try {
        return chains[this.chainId].name;
      } catch {
        return 'Unknown';
      }
    },
    chainColor() {
      let status;
      try {
        status = chains[this.chainId].status;
      } catch {
        status = 'error';
      }
      return colors[status];
    },
    chainIcon() {
      let status;
      try {
        status = chains[this.chainId].status;
      } catch {
        status = 'error';
      }
      return icons[status];
    },
    chainShow() {
      try {
        return chains[this.chainId].status !== 'ok';
      } catch {
        return true;
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
