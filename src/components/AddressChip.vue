<template>
  <q-chip
    clickable
    icon="fab fa-ethereum"
    color="primary"
    text-color="white"
    @click="onClick"
  >
    {{ address }}</q-chip
  >
</template>

<script>
export default {
  name: 'BlockchainChip',
  props: {
    address: {
      type: String,
      required: true,
    },
  },
  data() {
    return {};
  },
  methods: {
    onClick() {
      window.open(
        `https://explorer.19930528.xyz/account/${this.address}`,
        '_blank'
      );
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
