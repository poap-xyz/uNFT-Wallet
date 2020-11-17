<i18n />
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
        />
      </div>
    </q-scroll-area>
    <div v-if="loadedEvents && tokens.length == 0">
      {{ $t(tc + 'noVouchers') }}
    </div>
  </div>
</template>

<script>
import ABI from '../artifacts/ierc1155.abi.json';
import TokenCard from '../components/TokenCard.vue';

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
      default: 0
    },
    coinbase: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loadedEvents: false,
      contract: null,
      singleInbound: [],
      singleOutbound: [],
      batchInbound: [],
      batchOutbound: []
    };
  },
  computed: {
    tokens() {
      const singleIncomming = parseSingleEvents(this.singleInbound);
      const singleOutgoing = parseSingleEvents(this.singleOutbound);

      const batchIncomming = parseBatchEvents(this.batchInbound);
      const batchOutgoing = parseBatchEvents(this.batchOutbound);

      const allIncommingIds = Array.from(
        new Set([
          ...Object.keys(singleIncomming),
          ...Object.keys(batchIncomming)
        ])
      );

      const result = allIncommingIds
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
        .filter(token => token.amount > 0);

      return result;
    }
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
    loadEvents() {
      const singleInboundPromise = this.contract
        .getPastEvents('TransferSingle', {
          fromBlock: this.lastScanBlock,
          filter: { to: this.coinbase }
        })
        .then(events => {
          console.log(events);
          this.singleInbound = events;
        });
      const batchInboundPromise = this.contract
        .getPastEvents('TransferBatch', {
          fromBlock: this.lastScanBlock,
          filter: { to: this.coinbase }
        })
        .then(events => {
          console.log(events);
          this.batchInbound = events;
        });
      const singleOutboundPromise = this.contract
        .getPastEvents('TransferSingle', {
          fromBlock: this.lastScanBlock,
          filter: { from: this.coinbase }
        })
        .then(events => {
          console.log(events);
          this.singleOutbound = events;
        });
      const batchOutboundPromise = this.contract
        .getPastEvents('TransferBatch', {
          fromBlock: this.lastScanBlock,
          filter: { from: this.coinbase }
        })
        .then(events => {
          console.log(events);
          this.batchOutbound = events;
        });

      Promise.all([
        singleInboundPromise,
        singleOutboundPromise,
        batchInboundPromise,
        batchOutboundPromise
      ]).then(() => {
        this.loadedEvents = true;
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
</style>
