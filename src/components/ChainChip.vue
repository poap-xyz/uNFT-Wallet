<i18n lang="yaml">
en:
  tooltip: "Connected to {chainName}"

es:
  tooltip: "Conectado a {chainName}"
</i18n>
<template>
  <q-chip :icon="chainIcon" :color="chainColor">
    {{ chainName }}
    <q-tooltip>{{ $t('tooltip', { chainName }) }}</q-tooltip>
  </q-chip>
</template>

<script>
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
    chains: {
      type: Object,
      required: true
    },
    chainId: {
      type: Number,
      required: true
    }
  },
  computed: {
    chainName() {
      try {
        return this.chains[this.chainId].name;
      } catch {
        return `Unknown: ${this.chainId}`;
      }
    },
    chainColor() {
      let status;
      try {
        status = this.chains[this.chainId].status;
      } catch {
        status = 'error';
      }
      return colors[status];
    },
    chainIcon() {
      let status;
      try {
        status = this.chains[this.chainId].status;
      } catch {
        status = 'error';
      }
      return icons[status];
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
