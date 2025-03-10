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
  ttMultitransfer: 'Send several tokens using only two transactions'
  ttMultitransferDisabled: "Change to this contract's chain on your wallet to send several tokens using only two transactions"
  ttSearchTokens: 'Search for newly transfered tokens'
  ttSearchTokensDisabled: "Change to this contract's chain on your wallet to scan for new tokens"
  ttExpand: 'Expand'
  ttContact: 'Return to row view'
  ttDeleteContract: 'Delete this contract (can be added again later)'
  selectAll: 'Select all'
  clearSelection: 'Clear selection'
  cancel: 'Cancel'
  transfer: 'Transfer'
  multitransfer: 'Multitransfer'
  noMultitransferYet: 'Multitransfer is not deployed to this chain yet. Let me know over on Discord.'
  multitransferCanceled: 'Multitransfer canceled'
  multitransferInstructions:
    title: 'Instructions for Multitransfer'
    header: 'The multitransfer has 4 steps:'
    steps:
      - 'Select the tokens you want to transfer'
      - 'Click on the "Transfer" button in the bottom of the screen'
      - "Aprove the first transaction, this will allow uNFT Wallet to manage this contract's NFTs (only needed once per contract)"
      - 'Aprove the second transaction, this will do the actual transfer'

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
  ttMultitransfer: 'Envía varios tokens usando solo dos transacciones'
  ttMultitransferDisabled: 'Cambia a la cadena de este contrato para poder enviar varios tokens usando solo dos transacciones'
  ttSearchTokens: 'Busca tokens transferidos recientemente'
  ttSearchTokensDisabled: 'Cambia a la cadena de este contrato en tu billetera para poder buscar nuevos tokens'
  ttExpand: 'Expandir'
  ttContact: 'Regresar a modo renglon'
  ttDeleteContract: 'Borrar este contrato (se puede volver a agregar)'
  selectAll: 'Seleccionar todos'
  clearSelection: 'Deseleccionar todos'
  cancel: 'Cancelar'
  transfer: 'Transferir'
  multitransfer: 'Multitransferencia'
  noMultitransferYet: 'La funcionalidad de Multitransferencia no está disponible en esta cadena aún. Solicitala en Discord.'
  multitransferCanceled: 'Multitransferencia cancelada'
  multitransferInstructions:
    title: 'Instrucciones de multitransferencia'
    header: 'La multitransferencia involucra 4 pasos:'
    steps:
      - 'Seleccionar los tokens que deseas transferir'
      - 'Presiona "Transferir" en la parte inferior de la pantalla'
      - 'Aprueba la primer transacción, esta permite a uNFT Wallet administrar los NFTs de este contrato (solo una vez por contrato)'
      - 'Aprueba la segunda transacción, esta hará la transferencia'
</i18n>
<template>
  <div class="contract">
    <q-toolbar>
      <q-toolbar-title>
        <q-icon :name="chainIcon" size="lg">
          <q-tooltip>{{ chainName }}</q-tooltip>
        </q-icon>
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
      <q-btn
        v-if="type === 'ERC721'"
        flat
        round
        dense
        icon="merge_type"
        class="rotate-90"
        :disable="!onEnabledChain"
        @click="startMultitransfer"
      >
        <q-tooltip>{{ $t('ttMultitransfer') }}</q-tooltip>
      </q-btn>
      <div>
        <q-btn
          flat
          round
          dense
          icon="refresh"
          :disable="!onEnabledChain"
          @click="computeTokens"
        >
        </q-btn>
        <q-tooltip v-if="onEnabledChain">{{ $t('ttSearchTokens') }}</q-tooltip>
        <q-tooltip v-else>{{ $t('ttSearchTokensDisabled') }}</q-tooltip>
      </div>
      <q-btn flat round dense @click="expanded = !expanded">
        <q-icon v-if="expanded" name="expand_less" />
        <q-icon v-else name="expand_more" />
        <q-tooltip v-if="expanded">{{ $t('ttContact') }}</q-tooltip>
        <q-tooltip v-else>{{ $t('ttExpand') }}</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="delete"
        @click="$emit('delete', { address, alias })"
      >
        <q-tooltip>{{ $t('ttDeleteContract') }}</q-tooltip>
      </q-btn>
    </q-toolbar>
    <div
      v-if="loadedEvents"
      class="scroll-container"
      :class="{ expanded: expanded }"
    >
      <div v-if="tokens.length == 0">
        {{ $t('noTokens') }}
      </div>
      <div v-else style="height: 100%">
        <q-scroll-area v-if="!expanded" horizontal rounded-borders>
          <div class="row no-wrap q-pa-md items-start q-gutter-md">
            <q-intersection
              v-for="(token, index) in tokens"
              :key="token.id"
              class="card-intersection"
              :data-id="index"
            >
              <TokenCard
                v-bind="token"
                :type="type"
                :contract="contract"
                :coinbase="coinbase"
                :chain-id="chainId"
                @transfer="computeTokens"
              />
            </q-intersection>
          </div>
        </q-scroll-area>
        <div v-else>
          <div
            class="row q-pa-md justify-evenly q-gutter-md"
            :class="{ multiselection: multitransferSelecting }"
          >
            <div
              v-for="token in tokens"
              :key="token.id"
              class="token-wrapper"
              :class="{ selected: isTokenSelected(token.id) }"
              @click.capture="wrapperClick(token.id, $event)"
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
    <q-page-sticky
      v-if="multitransferSelecting"
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        fab
        class="multifab"
        color="primary"
        icon="select_all"
        :label="$t('selectAll')"
        @click="selectedTokens = tokens.map((t) => t.id)"
      />
      <q-btn
        fab
        class="multifab"
        color="warning"
        icon="clear"
        :label="$t('clearSelection')"
        @click="selectedTokens = []"
      />
      <q-btn
        fab
        class="multifab"
        color="negative"
        icon="cancel_schedule_send"
        :label="$t('cancel')"
        @click="cancelMultitransfer"
      />
      <q-btn
        fab
        class="multifab"
        color="positive"
        icon="send"
        :label="$t('transfer')"
        :disable="selectedTokens.length < 2"
        @click="doMultitransfer"
      />
    </q-page-sticky>
  </div>
</template>

<script>
import asyncPool from 'tiny-async-pool';
import TokenCard from './TokenCard';
import idb from '../idb';
import ContractUtils from '../mixins/ContractUtils';
import TransactionModal from '../mixins/TransactionModal';
import MultitransferDialog from './MultitransferDialog';
import blockchains from '../blockchains.json';

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
    res.push(await action(x));
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
    .then((events) => events.map((ev) => ev.returnValues.tokenId));
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
  const partialTokens = [];

  for await (const partialToken of asyncPool(500, tokenIds, async (tokenId) => {
    try {
      return await getOwner721(contract, tokenId);
    } catch (error) {
      return { tokenId, error };
    }
  })) {
    partialTokens.push(partialToken);
  }

  const currentlyOwnedTokens = partialTokens.filter(
    (token) =>
      token.error === null &&
      token.currentOwner.toLowerCase() === coinbase.toLowerCase()
  );

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

  const results = [];
  for await (const result of asyncPool(500, tokenIds, async (tokenId) => {
    try {
      return await contract.methods[uriFunctionName](tokenId).call().then((uri) => ({ id: tokenId, uri }))
    } catch (error) {
      return { id: tokenId, error };
    }
  })) {
    results.push(result);
  }
  return results;
}

function mergeAmount(tokens, amounts) {
  return tokens.map((token) => {
    const [amount] = amounts.filter(
      (amountToken) => token.id === amountToken.id
    );
    return { ...token, amount: amount.amount };
  });
}

function chainHasMultitransfer(currentChainId) {
  const chainIdsWithMultitransfer = Object.entries(blockchains)
    .filter(([, chain]) => chain.multitransferAddress !== undefined)
    .map(([chainId]) => chainId);
  return chainIdsWithMultitransfer.indexOf(currentChainId.toString()) > -1;
}

export default {
  name: 'ContractRow',
  components: { TokenCard },
  mixins: [ContractUtils, TransactionModal],
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
  emits: ['scan', 'delete', 'grab-fab', 'release-fab'],
  data() {
    return {
      loadedEvents: false,
      contract: null,
      tokens: [],
      nonUriTokensCount: 0,
      notFoundTokenCount: 0,
      unknownErrorCount: 0,
      latestBlock: 0,
      scanBlock: null,
      currentStep: 0,
      expanded: false,
      multitransferSelecting: false,
      selectedTokens: [],
      expandedFAB: true,
      chainIcon: 'question-mark',
      chainName: 'unknown',
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
      // eslint-disable-next-line @intlify/vue-i18n/no-dynamic-keys
      return `${this.currentStep + 1}/3: ${this.$t(steps[this.currentStep])}`;
    },
    onEnabledChain() {
      return this.chainId === this.$store.state.web3.chainId;
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
    if (blockchains[this.chainId]) {
      this.chainName = blockchains[this.chainId].name;
      if (blockchains[this.chainId].logo) {
        this.chainIcon = `img:/icons/blockchains/${
          blockchains[this.chainId].logo
        }.svg`;
      }
    }
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
      const oldTokens = await idb.getTokens(
        this.chainId,
        this.coinbase,
        this.address
      );

      if (!this.onEnabledChain) {
        this.tokens = oldTokens;
      } else {
        this.latestBlock = await this.$web3.instance.eth.getBlockNumber();

        const newTokenIds = await this.getNewIds(this.type, this.latestBlock);

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
      }
      this.loadedEvents = true;
      this.selectedTokens = [];
    },

    async getNewIds(type, lastBlock, maxBlocks = undefined) {
      if (lastBlock > this.lastScanBlock) {
        let ranges = [{ from: this.lastScanBlock, to: lastBlock }];
        if (maxBlocks) {
          ranges = computeScanRanges(this.lastScanBlock, lastBlock, maxBlocks);
        }

        try {
          let newIds = [];
          if (type === 'ERC721') {
            newIds = await this.getNewIds721(ranges);
          } else {
            newIds = await this.getNewIds1155(ranges);
          }

          return [...new Set(newIds)]; // Remove duplicates
        } catch (err) {
          const regexp =
            /eth_getLogs(?: and eth_newFilter)? are limited to a ([\d,]+) blocks range|exceed maximum block range: ([\d,]+)/;
          const matchesArray = err.message.match(regexp);
          const limitString = matchesArray[1] ?? matchesArray[2];
          if (limitString) {
            const parsedMaxBlocks = parseInt(
              limitString.replace(',', '').replace('.', ''),
              10
            );
            if (maxBlocks === undefined) {
              return this.getNewIds(type, lastBlock, parsedMaxBlocks);
            }
          }
          // eslint-disable-next-line no-console
          console.error(err);
        }
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
    startMultitransfer() {
      if (chainHasMultitransfer(this.chainId)) {
        this.expanded = true;
        this.multitransferSelecting = true;
        this.$emit('grab-fab');
        this.$q
          .dialog({
            title: this.$t('multitransferInstructions.title'),
            message: `
          ${this.$t('multitransferInstructions.header')}
          <ol>
            <li>
              ${this.$t('multitransferInstructions.steps[0]')}
            </li>
            <li>
              ${this.$t('multitransferInstructions.steps[1]')}
            </li>
            <li>
              ${this.$t('multitransferInstructions.steps[2]')}
            </li>
            <li>
              ${this.$t('multitransferInstructions.steps[3]')}
            </li>
          </ol>
          `,
            html: true,
            cancel: true,
            persistent: false,
          })
          .onCancel(() => {
            this.cancelMultitransfer();
          });
      } else {
        this.$q.dialog({
          title: this.$t('multitransfer'),
          message: this.$t('noMultitransferYet'),
          persistent: false,
        });
      }
    },
    doMultitransfer() {
      this.$q
        .dialog({
          component: MultitransferDialog,
          componentProps: {
            contract: this.contract,
            coinbase: this.coinbase,
            tokenIds: this.selectedTokens,
            chainId: this.chainId,
          },
        })
        .onOk(() => {
          this.closeMultitransfer();
          this.computeTokens();
        });
    },
    wrapperClick(tokenId, event) {
      if (this.multitransferSelecting) {
        event.preventDefault();
        const index = this.selectedTokens.indexOf(tokenId);
        if (index > -1) {
          this.selectedTokens.splice(index, 1);
        } else {
          this.selectedTokens.push(tokenId);
        }
      }
    },
    isTokenSelected(tokenId) {
      const index = this.selectedTokens.indexOf(tokenId);
      return index > -1;
    },
    closeMultitransfer() {
      this.$emit('release-fab');
      this.multitransferSelecting = false;
      this.selectedTokens = [];
    },
    cancelMultitransfer() {
      this.closeMultitransfer();
      this.$q.notify({
        type: 'warning',
        icon: 'cancel_schedule_send',
        message: this.$t('multitransferCanceled'),
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

.expanded.scroll-container {
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

.multiselection .token-wrapper {
  filter: brightness(0.6);
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  &.selected {
    filter: brightness(1);
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--q-positive);
      opacity: 0.7;
    }
  }
}

.multifab {
  display: grid;
  margin: 10px 0;
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
