<!-- eslint-disable @intlify/vue-i18n/no-unused-keys -->
<i18n lang="yaml">
en:
  noTokens: 'No tokens found'
  scanningBlock: 'Scanning block'
  uriErrorTitle: 'Error on tokens'
  uriErrorMessage: '{nonUriTokensCount} tokens for {alias} could not be displayed because their URI property is empty. Please check with the token creator.'
  notFoundErrorTitle: 'Tokens not Found'
  notFoundErrorMessage: '{notFoundTokenCount} tokens for {alias} could not be found on the blockchain, they could have been transferred to another chain or burned.'
  unknownErrorTitle: 'Unknown error scanning Tokens'
  unknownErrorMessage: '{unknownErrorCount} tokens for {alias} reported an error when scanning, please check with token issuer'
  scanBlockchain: 'Scanning the blockchain'
  checkOwnership: 'Verifying current owner of received tokens'
  getMetadata: 'Getting new token metadata'

es:
  noTokens: 'No se encontraron tokens'
  scanningBlock: 'Escaneando bloque'
  scanBlockchain: 'Escaneando la blockchain'
  checkOwnership: 'Verificando dueño actual de tokens recibidos'
  getMetadata: 'Obteniendo  metadatos de nuevos tokens'
  uriErrorTitle: 'Error en tokens'
  uriErrorMessage: '{nonUriTokensCount} tokens de {alias} no pueden ser desplegados porque su propiedad URI está vacía. Favor de revisar con los creadores del token.'
  notFoundErrorTitle: 'Tokens no encontrados'
  notFoundErrorMessage: '{notFoundTokenCount} tokens de {alias} no fueron encontrados en la blockchain, puede se hayan sido transferidos a otra cadena o quemados.'
  unknownErrorTitle: 'Error desconocido al escanear Tokens'
  unknownErrorMessage: '{unknownErrorCount} tokens de {alias} reportaron un error al escanear, favor de revisar con el emisor'
</i18n>

<template>
  <div class="contract">
    <q-toolbar>
      <q-toolbar-title>
        {{ alias }}
        <div class="text-caption">
          {{ address }}
          <a
            v-if="
              $web3.chains[chainId] && $web3.chains[chainId].explorerAddress
            "
            :href="$web3.chains[chainId].explorerAddress.replace('%s', address)"
            target="_blank"
            rel="noopener"
          >
            <q-icon name="fas fa-external-link-alt" />
          </a>
        </div>
      </q-toolbar-title>
      <q-chip outline>{{ type }}</q-chip>
      <q-btn
        v-if="notFoundTokenCount > 0"
        flat
        round
        dense
        class="text-warning"
        icon="warning"
        @click="showNotFoundErrors"
      />
      <q-btn
        v-if="nonUriTokensCount > 0"
        flat
        round
        dense
        class="text-warning"
        icon="warning"
        @click="showUriErrors"
      />
      <q-btn
        v-if="unknownErrorCount > 0"
        flat
        round
        dense
        class="text-warning"
        icon="warning"
        @click="showUnknownErrors"
      />
      <q-btn flat round dense icon="refresh" @click="computeTokens" />
      <q-btn flat round dense @click="expanded=!expanded"
        >
        <q-icon v-if="expanded" name="expand_less" />
        <q-icon v-else name="expand_more" />
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="delete"
        @click="$emit('delete', { address, alias })"
      />
    </q-toolbar>
    <div v-if="loadedEvents" class="scroll-container" v-bind:class="{expanded: expanded}">
      <div v-if="tokens.length == 0">
        {{ $t('noTokens') }}
      </div>
      <div v-else style="height:100%;">
        <q-scroll-area v-if="!expanded"  horizontal rounded-borders>
        <div class="row no-wrap q-pa-md items-start q-gutter-md">
          <q-intersection
            v-for="(token, index) in tokens"
            :key="token.id"
            class="card-intersection"
            :data-id="index"
          >
            <TokenCard
              v-if="inView[index]"
              v-bind="token"
              :type="type"
              :contract="contract"
              :coinbase="coinbase"
              @transfer="computeTokens"
            />
          </q-intersection>
        </div>
      </q-scroll-area>
      <div v-else >
        <div class="row q-pa-md justify-evenly q-gutter-md">
          <div
            v-for="(token) in tokens"
            :key="token.id"
          >
            <TokenCard
              v-bind="token"
              :type="type"
              :contract="contract"
              :coinbase="coinbase"
              @transfer="computeTokens"
            />
          </div>
        </div>
        </div>
    </div>
    </div>
    <div v-else class="scroll-container">
      <q-linear-progress
        size="25px"
        :value="(currentStep + 1) / 3"
        color="accent"
      >
        <div class="absolute-full flex flex-center">
          <q-badge color="white" text-color="accent" :label="stepLabel" />
        </div>
      </q-linear-progress>

      <q-linear-progress
        v-if="currentStep === 0"
        size="50px"
        :value="blockchainScanProgress"
        color="accent"
        class="q-mt-sm"
      >
        <div class="absolute-full flex flex-center">
          <q-badge
            color="white"
            text-color="accent"
            :label="blockchainScanProgressLabel"
          />
        </div>
      </q-linear-progress>
    </div>
  </div>
</template>

<script>
import asyncPool from 'tiny-async-pool';
import TokenCard from './TokenCard';
import idb from '../idb';
import ContractUtils from '../mixins/ContractUtils';

function computeScanRanges(start, end, maxBlocks) {
  const blockCount = end - start;
  const rangeCount = Math.ceil(blockCount / maxBlocks);
  const ranges = [];
  for (let i = 0; i < rangeCount; i += 1) {
    ranges.push({
      from: start + 1 + maxBlocks * i,
      to: start + maxBlocks * (i + 1) < end ? start + maxBlocks * (i + 1) : end,
    });
  }
  return ranges;
}

async function mapSeries(iterable, action) {
  const res = [];
  for (const x of iterable) {
    // eslint-disable-next-line no-await-in-loop
    // res.push(await action(x));
    // eslint-disable-next-line no-await-in-loop
    const y = await action(x);
    res.push(y);
  }
  return res.flat();
}

function parseSingleEvents(events) {
  return [
    ...events.reduce((accumulator, ev) => {
      const { id } = ev.returnValues;
      accumulator.add(id);
      return accumulator;
    }, new Set()),
  ];
}

function parseBatchEvents(events) {
  return [
    ...events.reduce((accumulator, ev) => {
      ev.returnValues.ids.forEach((id) => {
        accumulator.add(id);
      });
      return accumulator;
    }, new Set()),
  ];
}

function getLogs721(contract, coinbase, range) {
  return contract
    .getPastEvents('Transfer', {
      fromBlock: range.from,
      toBlock: range.to,
      filter: { to: coinbase },
    })
    .then((events) => {
      return events.map((ev) => {
        return ev.returnValues.tokenId;
      });
    });
}

function getLogs1155Single(contract, coinbase, range) {
  return contract
    .getPastEvents('TransferSingle', {
      fromBlock: range.from,
      toBlock: range.to,
      filter: { to: coinbase },
    })
    .then(parseSingleEvents);
}

function getLogs1155Batch(contract, coinbase, range) {
  return contract
    .getPastEvents('TransferBatch', {
      fromBlock: range.from,
      toBlock: range.to,
      filter: { to: coinbase },
    })
    .then(parseBatchEvents);
}

export async function getOwner721(contract, tokenId) {
  try {
    return {
      id: tokenId,
      currentOwner: await contract.methods.ownerOf(tokenId).call(),
      error: null,
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    const start = e.message.indexOf('{');
    const end = e.message.indexOf('}');
    const errorMessage = e.message.substring(start, end + 1);
    try {
      const errorCode = JSON.parse(errorMessage).code;
      if (errorCode === -32015) {
        return { id: tokenId, error: 'Not Found' };
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(err);
      return { id: tokenId, error: 'Unknown Error' };
    }

    throw e;
  }
}

export async function getAmount1155(contract, tokenId, account) {
  try {
    return contract.methods.balanceOf(account, tokenId).call();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    const start = e.message.indexOf('{');
    const end = e.message.indexOf('}');
    const errorMessage = e.message.substring(start, end + 1);
    try {
      const errorCode = JSON.parse(errorMessage).code;
      if (errorCode === -32015) {
        return { id: tokenId, error: 'Not Found' };
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(err);
      return { id: tokenId, error: 'Unknown Error' };
    }

    throw e;
  }
}

async function currentyOwned721(contract, coinbase, tokenIds) {
  const partialTokens = await asyncPool(500, tokenIds, (tokenId) =>
    getOwner721(contract, tokenId)
  );
  const currentlyOwnedTokens = partialTokens.filter((token) => {
    return (
      token.error === null &&
      token.currentOwner.toLowerCase() === coinbase.toLowerCase()
    );
  });

  const errorTokens = partialTokens.filter((token) => token.error !== null);
  return { currentlyOwnedTokens, errorTokens };
}

async function currentyOwned1155(contract, coinbase, tokenIds) {
  const coinbaseArray = new Array(tokenIds.length).fill(coinbase);

  const balances = await contract.methods
    .balanceOfBatch(coinbaseArray, tokenIds)
    .call();

  const tokens = tokenIds
    .map((tokenId, index) => ({
      id: tokenId,
      amount: parseInt(balances[index], 10),
    }))
    .filter((token) => token.amount > 0);

  return { currentlyOwnedTokens: tokens, errorTokens: [] };
}

export async function getMetadata(contract, type, tokenIds) {
  const uriFunctionName = type === 'ERC721' ? 'tokenURI' : 'uri';

  return asyncPool(500, tokenIds, (tokenId) => {
    return contract.methods[uriFunctionName](tokenId)
      .call()
      .then((uri) => ({ id: tokenId, uri }));
  });
}

function mergeAmount(tokens, amounts) {
  return tokens.map((token) => {
    const [amount] = amounts.filter(
      (amountToken) => token.id === amountToken.id
    );
    return { ...token, amount: amount.amount };
  });
}

export default {
  name: 'ContractRow',
  components: { TokenCard },
  mixins: [ContractUtils],
  props: {
    address: {
      type: String,
      required: true,
    },
    alias: {
      type: String,
      required: true,
    },
    lastScanBlock: {
      type: Number,
      default: -1,
    },
    coinbase: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: null,
    },
    chainId: {
      type: Number,
      required: true,
    },
  },
  emits: ['scan', 'delete'],
  data() {
    return {
      loadedEvents: false,
      contract: null,
      tokens: [],
      nonUriTokensCount: 0,
      notFoundTokenCount: 0,
      inView: [],
      unknownErrorCount: 0,
      latestBlock: 0,
      scanBlock: null,
      currentStep: 0,
      expanded: false
    };
  },
  computed: {
    blockchainScanProgressLabel() {
      return `${this.$t('scanningBlock')}: ${this.scanBlock}/${
        this.latestBlock
      }`;
    },
    blockchainScanProgress() {
      return (
        (this.scanBlock - this.lastScanBlock) /
        (this.latestBlock - this.lastScanBlock)
      );
    },
    stepLabel() {
      const steps = ['scanBlockchain', 'checkOwnership', 'getMetadata'];
      return `${this.currentStep + 1}/3: ${this.$t(steps[this.currentStep])}`;
    },
  },
  watch: {
    coinbase() {
      this.loadedEvents = false;
      this.computeTokens();
    },
  },
  created() {
    this.contract = this.getContract(
      this.$web3.instance,
      this.type,
      this.address
    );
    this.computeTokens();
    // Rescan on donations/mints
    if (
      this.$web3.donations[this.chainId.toString()] &&
      this.address ===
        this.$web3.donations[this.chainId.toString()].tokens[this.type].address
    ) {
      this.$$on('transferConfirmed', (ev) => {
        if (ev.contract === this.address) this.computeTokens();
      });
    }
  },
  methods: {
    async computeTokens() {
      this.latestBlock = await this.$web3.instance.eth.getBlockNumber();

      const newTokenIds = await this.getNewIds(this.type, this.latestBlock);

      const oldTokens = await idb.getTokens(
        this.chainId,
        this.coinbase,
        this.address
      );

      const oldTokenIds = oldTokens.map((token) => token.id);

      const tokenIds = oldTokenIds.concat(
        newTokenIds.filter((item) => oldTokenIds.indexOf(item) < 0)
      );
      this.currentStep = 1;
      const { currentlyOwnedTokens, errorTokens } =
        await this.getCurrentlyOwned(tokenIds);

      const currentlyOwnedTokenIds = currentlyOwnedTokens.map(
        (token) => token.id
      );

      const needMetadataTokenIds = currentlyOwnedTokenIds.filter(
        (tokenId) => oldTokenIds.indexOf(tokenId) < 0
      );

      this.currentStep = 2;
      const newTokensMetadata = await getMetadata(
        this.contract,
        this.type,
        needMetadataTokenIds
      );

      const newTokensMetadataComplete = newTokensMetadata.filter(
        (token) => token.uri !== null
      );

      const stillOwnedOldTokens = oldTokens.filter(
        (oldToken) => currentlyOwnedTokenIds.indexOf(oldToken.id) >= 0
      );

      this.tokens = stillOwnedOldTokens.concat(newTokensMetadataComplete);
      if (this.type === 'ERC1155') {
        this.tokens = mergeAmount(this.tokens, currentlyOwnedTokens);
      }

      this.unknownErrorCount = errorTokens.filter(
        (token) => token.error === 'Unknown Error'
      ).length;

      this.notFoundTokenCount = errorTokens.filter(
        (token) => token.error === 'Not Found'
      ).length;

      this.nonUriTokensCount =
        newTokensMetadata.length - newTokensMetadataComplete.length;

      this.tokens.forEach((token) =>
        idb.putToken(this.chainId, this.coinbase, this.address, token)
      );

      this.$emit('scan', {
        address: this.address,
        lastScanBlock: this.latestBlock,
        timeout: 120,
      });

      if (this.inView.length === 0) {
        this.inView = new Array(this.tokens.length).fill(false);
        this.inView.splice(0, 10, ...Array(10).fill(true));
      } else {
        const diff = this.inView.length - this.tokens.length;
        if (diff > 0) {
          this.inView.splice(diff * -1, diff);
        } else if (diff < 0) {
          this.inView.splice(this.inView.length, 0, Array(diff).fill(true));
        }
      }
      this.loadedEvents = true;
    },

    async getNewIds(type, lastBlock) {
      if (lastBlock > this.lastScanBlock) {
        let ranges = [{ from: this.lastScanBlock, to: lastBlock }];
        const maxBlocks = this.$web3.chains[this.chainId]
          ? this.$web3.chains[this.chainId].getLogsLimit
          : undefined;
        if (maxBlocks) {
          ranges = computeScanRanges(this.lastScanBlock, lastBlock, maxBlocks);
        }

        let newIds = [];
        if (type === 'ERC721') {
          newIds = await this.getNewIds721(ranges);
        } else {
          newIds = await this.getNewIds1155(ranges);
        }

        return [...new Set(newIds)]; // Remove duplicates
      }
      return [];
    },
    async getNewIds721(ranges) {
      const tokenIds = await mapSeries(ranges, (range) => {
        this.scanBlock = range.to;
        const lgs = getLogs721(this.contract, this.coinbase, range);
        return lgs;
      });
      return tokenIds;
    },
    async getNewIds1155(ranges) {
      const singleTokenIds = mapSeries(ranges, (range) =>
        getLogs1155Single(this.contract, this.coinbase, range)
      );
      const batchTokenIds = mapSeries(ranges, (range) => {
        this.scanBlock = range.to;
        return getLogs1155Batch(this.contract, this.coinbase, range);
      });

      const tokenIds = (
        await Promise.all([singleTokenIds, batchTokenIds])
      ).flat();
      return tokenIds;
    },

    async getCurrentlyOwned(tokenIds) {
      if (this.type === 'ERC721') {
        return currentyOwned721(this.contract, this.coinbase, tokenIds);
      }
      return currentyOwned1155(this.contract, this.coinbase, tokenIds);
    },

    showUriErrors() {
      this.$q.dialog({
        title: this.$t('uriErrorTitle'),
        message: this.$t('uriErrorMessage', {
          nonUriTokensCount: this.nonUriTokensCount,
          alias: this.alias,
        }),
      });
    },
    showUnknownErrors() {
      this.$q.dialog({
        title: this.$t('unknownErrorTitle'),
        message: this.$t('unknownErrorMessage', {
          unknownErrorCount: this.unknownErrorCount,
          alias: this.alias,
        }),
      });
    },
    showNotFoundErrors() {
      this.$q.dialog({
        title: this.$t('notFoundErrorTitle'),
        message: this.$t('notFoundErrorMessage', {
          notFoundTokenCount: this.notFoundTokenCount,
          alias: this.alias,
        }),
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
body.screen--xs .scroll-container {
  height: 388px;
}
.scroll-container {
  height: 269px;
}
.q-scrollarea {
  height: 100%;
  width: 100%;
}

.expanded.scroll-container{
    height: 100%;
}

.q-toolbar {
  padding: 5px 12px;
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
body.screen--xs .card-intersection {
  width: 300px;
}
body.body--light {
  .q-toolbar {
    background-color: #eeeeee;
    color: var(--q-primary);
    a {
      color: var(--q-primary);
      text-decoration: none;
    }

    .q-chip {
      color: var(--q-primary);
    }
  }
  .scroll-container {
    background-color: #e0e0e0;
  }
}

body.body--dark {
  .q-toolbar {
    background-color: var(--q-primary);
    a {
      color: white;
      text-decoration: none;
    }
  }
  .scroll-container {
    background-color: #0f1d1d;
  }
}
</style>
