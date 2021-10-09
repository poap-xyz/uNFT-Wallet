<template>
  <div>
    <div v-if="image">
      <q-avatar>
        <img :src="image" />
      </q-avatar>
    </div>
    <div v-else>
      <slot> </slot>
    </div>
  </div>
</template>

<script>
import Contract from 'web3-eth-contract';
import { getMetadata } from '../components/ContractRow';
import {
  handleBadCORS,
  handleDecentralizedProtocols,
  handleIdExpansion,
} from '../components/TokenCard';

import ABI721 from '../artifacts/ierc721metadata.abi.json';

export default {
  name: 'MetaAvatar',
  props: {
    address: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      metaAvatarContract: null,
      image: null,
      badCORSHosts: [],
    };
  },
  watch: {
    address() {
      this.load();
    },
  },
  created() {
    Contract.setProvider(this.$web3.mainnetProvider);
    this.metaAvatarContract = new Contract(
      ABI721,
      '0x263a1a8164d3904885ad9e1fdba6b8a4ad223ce1'
    );
    this.load();
  },
  methods: {
    async load() {
      const [metadata] = await getMetadata(this.metaAvatarContract, 'ERC721', [
        this.address,
      ]);
      const { uri } = metadata;
      const handledUri = handleBadCORS(
        handleIdExpansion(handleDecentralizedProtocols(uri), this.address),
        this.badCORSHosts
      );
      this.$axios.get(handledUri).then((response) => {
        if (response.data.image || response.data.image_url) {
          this.image = handleDecentralizedProtocols(
            response.data.image || response.data.image_url
          );
        }
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
