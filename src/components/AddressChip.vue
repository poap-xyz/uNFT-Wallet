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
  name: 'AddressChip',
  props: {
    address: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      reverseENS: false,
    };
  },
  watch: {
    address() {
      this.checkENS();
    },
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
