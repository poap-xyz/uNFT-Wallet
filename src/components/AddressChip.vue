<template>
  <q-chip
    clickable
    icon="fab fa-ethereum"
    color="primary"
    text-color="white"
    :title="address"
    @click="onClick"
  >
    {{ reverseENS || address }}</q-chip
  >
</template>

<script>
import Blockchains from '../blockchains.json';

function updateChain(chainId) {
  if (chainId && Blockchains[chainId.toString()]) {
    return {
      link: Blockchains[chainId.toString()].explorerAddress,
      iconUrl: Blockchains[chainId.toString()].icon,
    };
  }
  return {};
}

export default {
  name: 'AddressChip',
  props: {
    address: {
      type: String,
      required: true,
    },
    chainId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      reverseENS: false,
      link: null,
      iconUrl: null,
    };
  },
  watch: {
    address() {
      this.checkENS();
    },
    chainId() {
      ({ link: this.link, iconUrl: this.iconUrl } = updateChain(this.chainId));
    },
  },
  created() {
    this.checkENS();
    ({ link: this.link, iconUrl: this.iconUrl } = updateChain(this.chainId));
  },
  methods: {
    onClick() {
      window.open(this.link.replace('%s', this.address), '_blank');
    },
    checkENS() {
      this.$web3.ens
        .getName(this.address)
        .then(async (name) => {
          if (name.name !== null) {
            this.$web3.ens
              .name(name.name)
              .getAddress()
              .then((forwardAddress) => {
                if (this.address === forwardAddress) {
                  this.reverseENS = name.name;
                }
              });
          }
        })
        .catch(() => {});
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
