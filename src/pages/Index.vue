<i18n lang="yaml">
en:
  addContract: "Add Contract"
  deleteContract: "Delete Contract"
  deleteContractMessage: "Do you wish to delete {alias}?"

es:
  addContract: "Agregar Contrato"
  deleteContract: "Borrar contrato"
  deleteContractMessage: "¿Deseas borrar {alias}?"

</i18n>
<template>
  <div>
    <div v-if="connected">
      <!--<div>-->
      <ChainChip :chain-id="chain" />
      <AddressChip :address="coinbase" />
      <div class="row">
        <div class="col-xs-8"></div>
      </div>
      <ContractRow
        v-for="c in contracts"
        :key="c.address"
        :address="c.address"
        :alias="c.alias"
        :last-scan-block="c.lastScanBlock"
        :coinbase="coinbase"
        :chain="chain"
        @delete="onDeleteContract"
        @scan="onScanContract"
      />
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          fab
          icon="add"
          color="accent"
          :label="$t('addContract')"
          @click="showAddContractDialog"
        />
      </q-page-sticky>
    </div>
  </div>
</template>

<script>
import ContractRow from '../components/ContractRow.vue';
import AddressChip from '../components/AddressChip.vue';
import ChainChip from '../components/ChainChip.vue';
import AddContractDialog from '../components/AddContractDialog.vue';
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
    ChainChip,
    AddressChip,
    ContractRow,
    // eslint-disable-next-line vue/no-unused-components
    AddContractDialog
  },
  props: {},
  data() {
    return {
      contracts: []
    };
  },
  computed: {
    connected() {
      return this.coinbase !== null && this.chain !== null;
    },
    coinbase() {
      return this.$store.state.web3.coinbase;
    },
    chain() {
      return this.$store.state.web3.chainId;
    }
  },
  watch: {
    coinbase() {
      this.loadContracts();
    },
    chain() {
      this.loadContracts();
    }
  },
  created() {
    this.loadContracts();
  },
  methods: {
    async loadContracts() {
      if (this.coinbase && this.chain) {
        this.contracts = await idb.getContracts(this.chain, this.coinbase);
      }
    },
    async showAddContractDialog() {
      this.$q
        .dialog({
          component: AddContractDialog,
          parent: this,
          existing: this.contracts,
          chain: this.chain
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
                    title: "Can't find contract creation",
                    options: {
                      persistent: true
                    },
                    message:
                      "We could'nt determine when the contract was created. If you know the block where it was created (or the first block where you interacted with this contract), please write it in the field below. If you don't know, you may leave it blank, but scanning fot the first time will take a long time",
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
                chain: this.chain,
                account: this.coinbase,
                address: data.address,
                alias: data.alias,
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
    onDeleteContract(contract) {
      this.$q
        .dialog({
          title: this.$t('deleteContract'),
          message: this.$t('deleteContractMessage', { alias: contract.alias }),
          cancel: true
        })
        .onOk(() => {
          idb
            .deleteContract(this.chain, this.coinbase, contract.address)
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
        this.chain,
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
