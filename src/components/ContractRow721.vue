<i18n lang="yaml">
en:
  noTokens: "No tokens found"
  uriErrorTitle: "Error on tokens"
  uriErrorMessage: "{nonUriTokensCount} tokens for {alias} could not be displayed because their URI property is empty. Please check with the token creator."

es:
  noTokens: "No se encontraron tokens"
  uriErrorTitle: "Error en tokens"
  uriErrorMessage: "{nonUriTokensCount} tokens de {alias} no pueden ser desplegados porque su propiedad URI está vacía. Favor de revisar con los creadores del token."

</i18n>

<template>
  <div class="contract">
    <q-toolbar class="text-primary bg-grey-3">
      <q-toolbar-title>
        {{ alias }}
        <div class="text-caption ">{{ address }}</div>
      </q-toolbar-title>
      <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
      <q-chip outline color="primary">ERC721</q-chip>
      <q-btn
        v-if="nonUriTokensCount > 0"
        flat
        round
        dense
        class="text-warning"
        icon="warning"
        @click="showErrors"
      />
      <q-btn flat round dense icon="refresh" @click="computeTokens" />
      <q-btn
        flat
        round
        dense
        icon="delete"
        @click="$emit('delete', { address, alias })"
      />
    </q-toolbar>
    <q-scroll-area horizontal class="bg-grey-1 rounded-borders">
      <!--<div v-if="loadedEvents" class="">-->
      <div class="row no-wrap q-pa-md row items-start q-gutter-md">
        <q-intersection
          v-for="token in tokens"
          :key="token.id"
          class="card-intersection"
        >
          <TokenCard721
            v-bind="token"
            :contract="contract"
            :coinbase="coinbase"
            @transfer="computeTokens"
          />
        </q-intersection>
      </div>
    </q-scroll-area>
    <div v-if="loadedEvents && tokens.length == 0">
      {{ $t('noTokens') }}
    </div>
  </div>
</template>

<script>
import ABI from '../artifacts/ierc721metadata.abi.json';
import TokenCard721 from './TokenCard721.vue';
import idb from '../idb';

export default {
  name: 'ContractRow721',
  components: { TokenCard721 },
  props: {
    address: {
      type: String,
      required: true
    },
    alias: {
      type: String,
      required: true
    },
    lastScanBlock: {
      type: Number,
      default: -1
    },
    coinbase: {
      type: String,
      required: true
    },
    chain: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      loadedEvents: false,
      contract: null,
      tokens: [],
      singleInbound: [],
      batchInbound: [],
      nonUriTokensCount: 0
    };
  },
  watch: {
    coinbase() {
      this.loadedEvents = false;
      this.singleInbound = [];
      this.batchInbound = [];
      this.computeTokens();
    }
  },
  created() {
    this.contract = new this.$web3.instance.eth.Contract(ABI, this.address);
    this.computeTokens();
  },
  methods: {
    async computeTokens() {
      const lastBlock = await this.$web3.instance.eth.getBlockNumber();
      const newTokenIds = await this.getNewIds(lastBlock);

      const oldTokens = await idb.getTokens(
        this.chain,
        this.coinbase,
        this.address
      );

      const oldTokenIds = oldTokens.map(token => token.id);

      const tokenIds = oldTokenIds.concat(
        Array.from(newTokenIds).filter(item => oldTokenIds.indexOf(item) < 0)
      );

      const partialTokens = await Promise.all(
        await tokenIds.map(async tokenId => {
          return {
            id: tokenId,
            currentOwner: await this.contract.methods.ownerOf(tokenId).call()
          };
        })
      ).filter(token => token.currentOwner === this.coinbase);

      const fullTokens = await Promise.all(
        partialTokens.map(token => {
          return this.contract.methods
            .tokenURI(token.id)
            .call()
            .then(uri => ({ ...token, uri }));
        })
      );

      this.tokens = fullTokens.filter(token => token.uri);

      this.tokens.forEach(token =>
        idb.putToken(this.chain, this.coinbase, this.address, token)
      );

      this.$emit('scan', { address: this.address, lastScanBlock: lastBlock });

      this.nonUriTokensCount = fullTokens.length - this.tokens.length;
    },
    async getNewIds(lastBlock) {
      if (lastBlock > this.lastScanBlock) {
        const tokenIds = await this.contract
          .getPastEvents('Transfer', {
            fromBlock: this.lastScanBlock + 1,
            toBlock: lastBlock,
            filter: { to: this.coinbase }
          })
          .then(events => {
            return events.map(ev => ev.returnValues.tokenId);
          });
        return tokenIds;
      }
      return [];
    },
    showErrors() {
      this.$q.dialog({
        title: this.$t('uriErrorTitle'),
        message: this.$t('uriErrorMessage', {
          nonUriTokensCount: this.nonUriTokensCount,
          alias: this.alias
        })
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.q-scrollarea {
  height: 265px;
  width: 100%;
}
.contract {
  margin: 10px;
}
.alias {
  font-size: 2em;
  line-height: 1em;
  display: inline;
  margin-top: 0;
}
.card-intersection {
  width: 500px;
}
</style>
