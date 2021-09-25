<i18n lang="yaml">
en:
  unsupportedChain: 'The chain with ID {chainId} is not directly supported, please connect your wallet to that chain to view this NFT'

es:
  unsupportedChain: 'La cadena con ID {chainId} no es soportada directambete, favor de conectar tu wallet a esa cadena para ver este NFT'
</i18n>
<template>
  <div>
    <TokenDetails
      :hex-id="tokenId"
      :name="name"
      :type="type"
      :description="description"
      :contract-address="contractAddress"
      :chain="chain"
      :properties="properties"
      :image="image"
      :image-original="imageOriginal"
      :metadata-uri="handledUri"
      :metadata-uri-original="uri"
      :owner="owner"
      :amount="amount"
    />
    <q-page-sticky position="bottom-left" :offset="[18, 18]">
      <q-btn fab icon="favorite" color="red" @click="showMintDialog" />
    </q-page-sticky>
  </div>
</template>

<script>
import Web3 from 'web3';

import MintDialog from '../components/MintDialog';
import idb from '../idb';
import { ContractUtils, getContractType } from '../mixins/ContractUtils';
import {
  getMetadata,
  getOwner721,
  getAmount1155,
} from '../components/ContractRow';
import {
  handleBadCORS,
  handleDecentralizedProtocols,
  handleIdExpansion,
  handleLocaleExpansion,
} from '../components/TokenCard';
import TokenDetails from '../components/TokenDetails';

export default {
  name: 'SingleToken',
  components: { TokenDetails },
  mixins: [ContractUtils],
  props: {
    chainId: {
      type: String,
      required: true,
    },
    contractAddress: {
      type: String,
      required: true,
    },
    tokenId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      contract: null,
      type: null,
      badCORSHosts: [],
      name: null,
      description: null,
      properties: null,
      image: null,
      imageOriginal: null,
      owner: null,
      loaded: false,
      handledUri: null,
      uriOwner: null,
      amount: null,
    };
  },
  computed: {
    chain() {
      return parseInt(this.chainId, 10);
    },
  },
  watch: {
    chainId() {
      this.init();
    },
    contractAddress() {
      this.init();
    },
    tokenId() {
      this.init();
    },
  },
  async created() {
    this.uriOwner = this.$route.query.owner;
    this.init();
  },
  methods: {
    async init() {
      let web3 = this.$web3.instance;
      if (!web3 || this.$store.state.web3.chainId !== this.chainId) {
        if (
          this.$web3.chains[this.chainId] &&
          this.$web3.chains[this.chainId].rpc
        ) {
          web3 = new Web3(this.$web3.chains[this.chainId].rpc);
        }
      }
      if (web3) {
        this.type = await getContractType(web3, this.contractAddress);
        this.contract = this.getContract(web3, this.type, this.contractAddress);
        const [metadata] = await getMetadata(this.contract, this.type, [
          this.tokenId,
        ]);
        this.uri = metadata.uri;
        if (this.type === 'ERC721') {
          this.owner = (
            await getOwner721(this.contract, this.tokenId)
          ).currentOwner;
        } else if (this.type === 'ERC1155' && this.uriOwner) {
          this.amount = await getAmount1155(
            this.contract,
            this.tokenId,
            this.uriOwner
          );
          if (this.amount > 0) this.owner = this.uriOwner;
        }
        await this.load();
        this.loaded = true;
      } else {
        this.$q.notify({
          type: 'negative',
          message: this.$t('unsupportedChain', { chainId: this.chainId }),
        });
      }
    },
    load() {
      this.handledUri = handleBadCORS(
        handleIdExpansion(handleDecentralizedProtocols(this.uri), this.tokenId),
        this.badCORSHosts
      );
      this.$axios
        .get(this.handledUri)
        .then((response) => {
          if (response.data.localization) {
            this.avalilableLocales = response.data.localization.locales;
          }
          if (
            response.data.localization &&
            this.$i18n.locale !== response.data.localization.default &&
            response.data.localization.locales.includes(this.$i18n.locale)
          ) {
            const handledLocaleUri = this.handleBadCORS(
              handleLocaleExpansion(
                handleIdExpansion(
                  handleDecentralizedProtocols(response.data.localization.uri),
                  this.id
                ),
                this.$i18n.locale
              ),
              this.badCORSHosts
            );

            this.$axios.get(handledLocaleUri).then((localeResponse) => {
              this.name = localeResponse.data.name || response.data.name;
              this.description =
                localeResponse.data.description || response.data.description;
              this.properties =
                localeResponse.data.properties ||
                response.data.properties ||
                response.data.attributes;
            });
          } else {
            this.name = response.data.name;
            this.description = response.data.description;

            this.properties =
              response.data.properties || response.data.attributes;
          }
          if (response.data.image || response.data.image_url) {
            this.imageOriginal = response.data.image || response.data.image_url;
            this.image = handleDecentralizedProtocols(
              response.data.image || response.data.image_url
            );
          }
        })
        .catch((err) => {
          if (typeof err.response === 'undefined') {
            if (!this.fixedCORS) {
              const url = new URL(this.uri);
              this.$store.dispatch('badCors/addHost', url.host);
              this.fixedCORS = true;
              this.load();
            } else {
              this.state = 'Network error';
            }
          } else if (err.response.status >= 400 && err.response.status <= 503) {
            this.state = 'Remote server error';
          }
        });
    },

    async showMintDialog() {
      this.$q
        .dialog({
          component: MintDialog,
          componentProps: {
            chainId: this.chainId,
            coinbase: this.coinbase,
          },
        })
        .onOk(({ address, type, blockCreated }) => {
          const contract = {
            chain: this.chainId,
            account: this.coinbase,
            address,
            alias: `uNFT Wallet ${type}`,
            type,
            lastScanBlock: blockCreated - 1,
          };
          idb.addContract(contract).then(() => {
            this.contracts.push(contract);
          });
        });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.q-banner p:last-of-type {
  margin-bottom: 0;
}

.q-banner__avatar {
  margin: auto;
}
</style>
