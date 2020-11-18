<i18n lang="yaml">
en:
  noTokens: "No tokens found"

es:
  noTokens: "No se encontraron tokens"
</i18n>

<template>
  <div class="contract">
    <q-toolbar class="text-primary bg-grey-3">
      <q-toolbar-title>
        {{ alias }}
        <div class="text-caption ">{{ address }}</div>
      </q-toolbar-title>
      <q-btn flat round dense icon="refresh" @click="loadEvents" />
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
        <TokenCard
          v-for="(token, index) in tokens"
          :key="index"
          v-bind="token"
          :contract="contract"
          :coinbase="coinbase"
          @transfer="loadEvents"
        />
      </div>
    </q-scroll-area>
    <div v-if="loadedEvents && tokens.length == 0">
      {{ $t('noTokens') }}
    </div>
  </div>
</template>

<script>
import ABI from '../artifacts/ierc1155.abi.json';
import TokenCard from '../components/TokenCard.vue';
import idb from '../idb';

function parseSingleEvents(events) {
  return events.reduce((accumulator, ev) => {
    const { id, value } = ev.returnValues;
    // eslint-disable-next-line no-param-reassign,operator-assignment
    accumulator[id] = (accumulator[id] || 0) + Number(value);
    return accumulator;
  }, {});
}

function parseBatchEvents(events) {
  return events.reduce((accumulator, ev) => {
    ev.returnValues.ids.forEach((id, index) => {
      // eslint-disable-next-line no-param-reassign,operator-assignment
      accumulator[id] =
        (accumulator[id] || 0) + Number(ev.returnValues.values[index]);
    });
    return accumulator;
  }, {});
}

export default {
  name: 'ContractRow',
  components: { TokenCard },
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
      singleOutbound: [],
      batchInbound: [],
      batchOutbound: []
    };
  },
  watch: {
    // eslint-disable-next-line object-shorthand
    coinbase: function() {
      this.loadedEvents = false;
      this.singleInbound = [];
      this.batchInbound = [];
      this.singleOutbound = [];
      this.batchOutbound = [];
      this.loadEvents();
    }
  },
  created() {
    this.contract = new this.$web3.instance.eth.Contract(ABI, this.address);
    this.loadEvents();
  },
  methods: {
    async computeTokens(lastScanBlock) {
      const updates = await this.computeNewTokens();

      const updatesIds = updates.map(token => token.id);

      const oldTokens = await idb.getTokens(
        this.chain,
        this.coinbase,
        this.address
      );

      const oldTokenIds = oldTokens.map(token => token.id);

      const newTokenIds = updatesIds.filter(id => !oldTokenIds.includes(id));
      const updatedTokenIds = updatesIds.filter(id => oldTokenIds.includes(id));

      const notUpdatedTokens = oldTokens.filter(
        token => !updatedTokenIds.includes(token.id)
      );
      const newTokens = updates.filter(token => newTokenIds.includes(token.id));

      const updatedTokens = updatedTokenIds.map(id => ({
        id,
        amount:
          oldTokens[oldTokenIds.indexOf(id)].amount +
          updates[updatesIds.indexOf(id)].amount,
        uri: updates[updatesIds.indexOf(id)].uri
      }));

      this.tokens = notUpdatedTokens.concat(updatedTokens, newTokens);

      updatedTokens.forEach(token =>
        idb.putToken(this.chain, this.coinbase, this.address, token)
      );

      newTokens.forEach(token =>
        idb.putToken(this.chain, this.coinbase, this.address, token)
      );

      this.$emit('scan', { address: this.address, lastScanBlock });
    },
    computeNewTokens() {
      const singleIncomming = parseSingleEvents(this.singleInbound);
      const singleOutgoing = parseSingleEvents(this.singleOutbound);

      const batchIncomming = parseBatchEvents(this.batchInbound);
      const batchOutgoing = parseBatchEvents(this.batchOutbound);

      const allIds = Array.from(
        new Set([
          ...Object.keys(singleIncomming),
          ...Object.keys(batchIncomming),
          ...Object.keys(singleOutgoing),
          ...Object.keys(batchOutgoing)
        ])
      );

      const newTokens = allIds
        .map(id => {
          return {
            id,
            amount:
              (singleIncomming[id] || 0) +
              (batchIncomming[id] || 0) -
              (singleOutgoing[id] || 0) -
              (batchOutgoing[id] || 0)
          };
        })
        .filter(token => token.amount != 0);

      return Promise.all(
        newTokens.map(token => {
          return this.contract.methods
            .uri(token.id)
            .call()
            .then(uri => ({ ...token, uri }));
        })
      );
    },
    async loadEvents() {
      const lastBlock = await this.$web3.instance.eth.getBlockNumber();
      if (lastBlock > this.lastScanBlock) {
        const singleInboundPromise = this.contract
          .getPastEvents('TransferSingle', {
            fromBlock: this.lastScanBlock + 1,
            toBlock: lastBlock,
            filter: { to: this.coinbase }
          })
          .then(events => {
            this.singleInbound = events;
          });
        const batchInboundPromise = this.contract
          .getPastEvents('TransferBatch', {
            fromBlock: this.lastScanBlock + 1,
            toBlock: lastBlock,
            filter: { to: this.coinbase }
          })
          .then(events => {
            this.batchInbound = events;
          });
        const singleOutboundPromise = this.contract
          .getPastEvents('TransferSingle', {
            fromBlock: this.lastScanBlock + 1,
            toBlock: lastBlock,
            filter: { from: this.coinbase }
          })
          .then(events => {
            this.singleOutbound = events;
          });
        const batchOutboundPromise = this.contract
          .getPastEvents('TransferBatch', {
            fromBlock: this.lastScanBlock + 1,
            toBlock: lastBlock,
            filter: { from: this.coinbase }
          })
          .then(events => {
            this.batchOutbound = events;
          });

        Promise.all([
          singleInboundPromise,
          singleOutboundPromise,
          batchInboundPromise,
          batchOutboundPromise
        ]).then(() => {
          this.loadedEvents = true;
          this.computeTokens(lastBlock);
        });
      } else {
        this.computeTokens(lastBlock);
      }
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
</style>
