<i18n lang="yaml">
en:
  addContract: "Add Contract"
  deleteContract: "Delete Contract"
  deleteContractMessage: "Do you wish to delete {alias}?"
  noContractsAddContract: "You don't seem to have any contracts, add one using the button in the lower left corner"
  noContractsMint: "If you don't have any NFT yet you can mint one using the button in the lower right corner"
  createdBlockErrorTitle: "Can't find contract creation"
  createdBlockErrorMessage: "We couldn't determine when the contract was created. If you know the block where it was created (or the first block where you interacted with this contract), please write it in the field below. If you don't know, you may leave it blank, but scanning fot the first time may take a long time"

es:
  addContract: "Agregar Contrato"
  deleteContract: "Borrar contrato"
  deleteContractMessage: "¿Deseas borrar {alias}?"
  noContractsAddContract: "Parece que no has agregado ningún contrato, da uno de alta usando el botón de la esquina inferior derecha"
  noContractsMint: "Si todavía no tienes ningún NFT, puedes acuñar uno con el botón de la esquina inferior izquierda"
  createdBlockErrorTitle: "No fue posible encontrar la creación del contrato"
  createdBlockErrorMessage: "No fue posible determinar cuando se creó el contrato. Si sabes en que bloque se creó, (o el primer bloque cuando interactuaste con este contrato), por favor escríbelo en el campo siguiente a este mensaje. Si no sabes, lo puedes dejar en blanco, pero la búsqueda inicial puede tomar mucho tiempo"

</i18n>
<template>
  <div>
    <div v-if="connected">
      <!--<div>-->
      <div class="row">
        <div class="col-xs-8"></div>
      </div>
      <div v-for="c in contracts" :key="chainId + coinbase + c.address">
        <ContractRow
          :type="c.type"
          :address="c.address"
          :alias="c.alias"
          :last-scan-block="c.lastScanBlock"
          :coinbase="coinbase"
          :chain-id="chainId"
          @delete="onDeleteContract"
          @scan="onScanContract"
        />
      </div>
      <div v-if="contracts.length === 0" class="q-pa-md q-gutter-sm">
        <q-banner class="bg-primary text-white center">
          <template v-slot:avatar>
            <q-icon name="sentiment_dissatisfied" color="accent" />
          </template>
          <p>
            {{ $t('noContractsAddContract') }}
          </p>
          <p>
            {{ $t('noContractsMint') }}
          </p>
        </q-banner>
      </div>
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          fab
          icon="add"
          color="accent"
          :label="$t('addContract')"
          @click="showAddContractDialog"
        />
      </q-page-sticky>
      <q-page-sticky position="bottom-left" :offset="[18, 18]">
        <q-btn fab icon="favorite" color="red" @click="showMintDialog" />
      </q-page-sticky>
    </div>
  </div>
</template>

<script>
import ContractRow from '../components/ContractRow.vue';
import AddContractDialog from '../components/AddContractDialog.vue';
import MintDialog from '../components/MintDialog.vue';
import idb from '../idb';

async function searchContractCretionBlock(web3, contractAddress) {
  // https://ethereum.stackexchange.com/a/65210
  let highestBlock = await web3.eth.getBlockNumber();
  let lowestBlock = 0;

  let contractCode = await web3.eth.getCode(contractAddress, highestBlock);
  if (contractCode === '0x') {
    return -1;
  }

  while (lowestBlock <= highestBlock) {
    const searchBlock = parseInt((lowestBlock + highestBlock) / 2, 10);
    try {
      // eslint-disable-next-line no-await-in-loop
      contractCode = await web3.eth.getCode(contractAddress, searchBlock);
    } catch (err) {
      return -2;
    }
    if (contractCode !== '0x') {
      highestBlock = searchBlock;
    } else if (contractCode === '0x') {
      lowestBlock = searchBlock;
    }

    if (highestBlock === lowestBlock + 1) {
      return highestBlock;
    }
  }
  return -1;
}

export default {
  name: 'MyVouchers',
  components: {
    ContractRow
  },
  props: {},
  data() {
    return {
      contracts: []
    };
  },
  computed: {
    connected() {
      return this.coinbase !== null && this.chainId !== null;
    },
    coinbase() {
      return this.$store.state.web3.coinbase;
    },
    chainId() {
      return this.$store.state.web3.chainId;
    }
  },
  watch: {
    coinbase() {
      this.loadContracts();
    },
    chainId() {
      this.loadContracts();
    }
  },
  created() {
    if (this.connected) {
      this.loadContracts();
    } else {
      this.$router.push({ path: 'welcome' });
    }
  },
  methods: {
    async loadContracts() {
      if (this.coinbase && this.chainId) {
        this.contracts = await idb.getContracts(this.chainId, this.coinbase);
      }
    },
    async showAddContractDialog() {
      this.$q
        .dialog({
          component: AddContractDialog,
          parent: this,
          existing: this.contracts,
          chain: this.chainId
        })
        .onOk(async data => {
          let blockCreated = -1;
          if (data.blockCreated) {
            blockCreated = data.blockCreated;
          } else {
            blockCreated = await searchContractCretionBlock(
              this.$web3.instance,
              data.address
            );
          }
          if (blockCreated === -1) {
            this.$notify({
              type: 'negative',
              message: 'Contract not found'
            });
          } else {
            if (blockCreated === -2) {
              await new Promise((resolve, reject) => {
                this.$q
                  .dialog({
                    title: this.$t('createdBlockErrorTitle'),
                    options: {
                      persistent: true
                    },
                    message: this.$t('createdBlockErrorMessage'),
                    prompt: {
                      type: 'number'
                    },
                    cancel: true,
                    persistent: true
                  })
                  .onOk(userBlock => {
                    if (userBlock === undefined) {
                      blockCreated = 1;
                    } else {
                      blockCreated = userBlock;
                    }
                    resolve();
                  })
                  .onCancel(() => {
                    reject();
                  });
              });
            }
            if (blockCreated > 0) {
              const contract = {
                chain: this.chainId,
                account: this.coinbase,
                address: data.address,
                alias: data.alias,
                type: data.type,
                lastScanBlock: blockCreated - 1
              };
              idb.addContract(contract).then(() => {
                this.contracts.push(contract);
              });
            } else {
              this.$notify({
                type: 'negative',
                message: 'Contract not addedd'
              });
            }
          }
        });
    },
    async showMintDialog() {
      this.$q
        .dialog({
          component: MintDialog,
          parent: this,
          chainId: this.chainId,
          coinbase: this.coinbase
        })
        .onOk(({ address, type, blockCreated }) => {
          const contract = {
            chain: this.chainId,
            account: this.coinbase,
            address,
            alias: `uNFT Wallet ${type}`,
            type,
            lastScanBlock: blockCreated - 1
          };
          idb.addContract(contract).then(() => {
            this.contracts.push(contract);
          });
        });
    },
    onDeleteContract(contract) {
      this.$q
        .dialog({
          title: this.$t('deleteContract'),
          message: this.$t('deleteContractMessage', { alias: contract.alias }),
          cancel: true
        })
        .onOk(() => {
          idb
            .deleteContract(this.chainId, this.coinbase, contract.address)
            .then(() => {
              this.contracts.splice(
                this.contracts.findIndex(c => c.address === contract.address),
                1
              );
            });
        });
    },
    onScanContract(e) {
      idb.updateContractScan(
        this.chainId,
        this.coinbase,
        e.address,
        e.lastScanBlock
      );
      const index = this.contracts
        .map(contract => contract.address)
        .indexOf(e.address);
      this.contracts[index].lastScanBlock = e.lastScanBlock;
    },
    logout() {
      this.$refs.web3modal.logout();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
