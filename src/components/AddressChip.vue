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
export default {
  name: 'BlockchainChip',
  props: {
    address: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      reverseENS: false
    };
  },
  watch: {
    address() {
      this.checkENS();
    }
  },
  created() {
    this.reverseENS = false;
    this.checkENS();
  },
  methods: {
    onClick() {
      window.open(`https://etherscan.io/address/${this.address}`, '_blank');
    },
    checkENS() {
      this.$web3.ens
        .reverse(this.address)
        .name()
        .then(async name => {
          const forwardENS = await this.$web3.ens.resolver(name).addr();
          if (this.address === forwardENS) {
            this.reverseENS = name;
          } else {
            this.reverseENS = false;
          }
        })
        .catch(() => {
          this.reverseENS = false;
        });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
