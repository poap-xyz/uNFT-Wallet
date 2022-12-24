<template>
  <q-avatar>
    <img :src="image" />
  </q-avatar>
</template>

<script>
import makeBlockie from 'ethereum-blockies-base64';

export default {
  name: 'Web3Blockie',
  props: {
    address: {
      type: String,
      default: '',
    },
  },
  computed: {
    // eslint-disable-next-line object-shorthand
    image() {
      return makeBlockie(this.address);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
