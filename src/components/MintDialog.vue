<i18n lang="yaml">
en:
  mintNFT: "Mint NFT"
  collection: "Collection"
  mint: "Mint"
  minted: "Minted"
  available: "Available"
  reset: "Reset"
  tokenType: "Type"
  donationAmount: "Donation amount"
  donation: "Donation"
  justGas: "Just Gas"
  collectionFinished: "All NFTs from this collection have been minted, choose another collection"
  collectionNotAvailable: "Collection not available"
es:
  mintNFT: "Acuñar NFT"
  collection: "Colección"
  mint: "Acuñar"
  minted: "Acuñados"
  available: "Disponibles"
  reset: "Borrar"
  tokenType: "Tipo"
  donationAmount: "Donación"
  donation: "Donación"
  justGas: "Solo Gas"
  collectionFinished: "Todos los NFTs de esta colección han sido acuñados, elije otra colección"
  collectionNotAvailable: "Colección no disponible"

</i18n>

<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card>
      <q-toolbar>
        <q-toolbar-title>{{ $t('mintNFT') }}</q-toolbar-title>

        <q-btn v-close-popup flat round dense icon="close" />
      </q-toolbar>
      <q-card-section>
        <q-form class="q-gutter-md" novalidate @submit="mint" @reset="reset">
          <q-select
            v-model="type"
            :options="types"
            :label="$t('tokenType')"
            option-label="type"
            @input="loadStats"
          />
          <q-select
            v-model="collection"
            :options="collections"
            :label="$t('collection')"
            option-label="name"
            @input="loadStats"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <q-item-label v-html="scope.opt.name" />
                </q-item-section>
                <q-item-section avatar>
                  <q-chip outline square size="sm">
                    <div v-if="scope.opt.donate">
                      {{ $t('donation') }}
                    </div>
                    <div v-else>
                      {{ $t('justGas') }}
                    </div>
                  </q-chip>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <div v-if="uri !== null">
            <div v-if="uri !== ''">
              <!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
              {{ $t('minted') }} <b>{{ minted }}</b
              >/<b>{{ supplyAdjusted }}</b> {{ $t('available') }}
              <!-- eslint-enable @intlify/vue-i18n/no-raw-text -->
              <TokenCard :key="uri" :type="type" :uri="uri" hide-transfer />

              <div v-if="parseInt(minted) < parseInt(supply)">
                <q-input
                  v-if="min > 0"
                  v-model="donation"
                  type="number"
                  :label="$t('donationAmount')"
                  :hint="minHint"
                  :min="minBase"
                  :step="minBase"
                >
                  <template v-slot:append>
                    <div class="ticker">
                      {{ ticker }}
                    </div>
                  </template>
                </q-input>
              </div>
              <div v-else>
                {{ $t('collectionFinished') }}
              </div>
            </div>
            <div v-else>
              {{ $t('collectionNotAvailable') }}
            </div>
          </div>
          <q-card-actions align="right">
            <q-btn
              :label="$t('reset')"
              color="primary"
              flat
              class="q-ml-sm"
              type="reset"
            />
            <q-btn :label="$t('mint')" type="submit" color="primary" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import ABI721 from '../artifacts/unft721.abi.json';
import ABI1155 from '../artifacts/unft1155.abi.json';
import TokenCard from './TokenCard.vue';
import TransactionModal from '../mixins/TransactionModal.vue';

const abis = {
  ERC721: ABI721,
  ERC1155: ABI1155
};

export default {
  name: 'MintDialog',
  components: { TokenCard },
  mixins: [TransactionModal],
  props: {
    chainId: {
      type: Number,
      required: true
    },
    coinbase: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      type: null,
      types: ['ERC721', 'ERC1155'],
      collection: null,
      supply: null,
      minted: null,
      uri: null,
      min: null,
      donation: null,
      contract: null
    };
  },
  computed: {
    commonContracts() {
      return [];
    },
    commonSelectionType() {
      if (this.commonSelection) return this.commonSelection.type;
      return null;
    },
    collections() {
      if (this.type) {
        return this.$web3.donations[this.chainId].tokens[this.type].collections;
      }
      return [];
    },
    minBase() {
      return this.min / 10 ** this.$web3.donations[this.chainId].decimals;
    },
    ticker() {
      return this.$web3.donations[this.chainId].ticker;
    },
    minHint() {
      return `min.  ${this.minBase} ${this.ticker}`;
    },
    supplyAdjusted() {
      const MAX_UINT256 =
        '115792089237316195423570985008687907853269984665640564039457584007913129639935';
      if (this.supply === MAX_UINT256) {
        return '∞';
      }
      return this.supply;
    },
    address() {
      return this.$web3.donations[this.chainId].tokens[this.type].address;
    }
  },
  methods: {
    reset() {
      this.type = null;
      this.collection = null;
      this.supply = null;
      this.minted = null;
      this.uri = null;
      this.min = null;
      this.donation = null;
    },
    async getCollectionURI(collectionId) {
      const uriFunctionName = this.type === 'ERC721' ? 'collectionURI' : 'uri';

      return this.contract.methods[uriFunctionName](collectionId).call();
    },
    async loadStats() {
      if (this.collection !== null && this.type !== null) {
        this.contract = new this.$web3.instance.eth.Contract(
          abis[this.type],
          this.address
        );
        this.uri = await this.getCollectionURI(this.collection.id);
        if (this.uri !== '') {
          this.supply = await this.contract.methods
            .collectionSupply(this.collection.id)
            .call();
          this.minted = await this.contract.methods
            .collectionMinted(this.collection.id)
            .call();
          this.min = await this.contract.methods
            .collectionMin(this.collection.id)
            .call();
          this.donation = this.minBase;
        } else {
          throw Error('Collection does not exist');
        }
      }
    },
    onOKClick() {
      this.$emit('ok', {
        address: this.address,
        type: this.type,
        blockCreated:
          this.$web3.donations[this.chainId].tokens[this.type].blockCreated || 1
      });

      this.hide();
    },
    async mint() {
      const donationInt =
        this.donation * 10 ** this.$web3.donations[this.chainId].decimals;
      const estimatedGas = await this.contract.methods
        .mint(this.collection.id)
        .estimateGas({ from: this.coinbase, value: donationInt })
        .catch(err => {
          this.transactionError(err);
          throw err;
        });

      this.alertAprove();

      this.contract.methods
        .mint(this.collection.id)
        .send({
          gas: estimatedGas,
          from: this.coinbase,
          value: donationInt
        })
        .on('receipt', this.transactionReceipt)
        .on('transactionHash', this.transactionHash)
        .on('error', this.transactionError);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.body--dark {
  .q-tab--active {
    color: gray !important;
  }
  .q-tab__indicator {
    background: gray;
  }
}
.ticker {
  font-size: 0.7em;
}
</style>
