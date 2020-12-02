<i18n lang="yaml">
en:
  addContract: "Add Contract"
  logout: "Logout"
  deleteContract: "Delete Contract"
  deleteContractMessage: "Do you wish to delete {alias}?"

es:
  addContract: "Agregar Contrato"
  logout: "Salir"
  deleteContract: "Borrar contrato"
  deleteContractMessage: "¿Deseas borrar {alias}?"

</i18n>
<template>
  <div>
    <LanguageChanger :languages="languages" />
    <div v-if="connected">
      <!--<div>-->
      <ChainChip :chain-id="chain" />
      <AddressChip :address="coinbase" />
      <q-btn round flat>
        <Blockie :address="coinbase"></Blockie>
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item v-close-popup clickable @click="logout">
              <q-item-section>{{ $t('logout') }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <div class="row">
        <div class="col-xs-8">
          <span class="truncate-chip-labels"> </span>
        </div>
      </div>
      <ContractRow
        v-for="c in contracts"
        v-bind:key="c.address"
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

    <Web3Modal
      ref="web3modal"
      @accountChanged="accountChanged"
      @chainChanged="chainChanged"
    />
  </div>
</template>

<script>
import ContractRow from '../components/ContractRow.vue';
import Web3Modal from '../components/Web3Modal.vue';
import AddressChip from '../components/AddressChip.vue';
import LanguageChanger from '../components/LanguageChanger.vue';
import Blockie from '../components/Blockie.vue';
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
    // eslint-disable-next-line no-await-in-loop
    contractCode = await web3.eth.getCode(contractAddress, searchBlock);

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
    Web3Modal,
    LanguageChanger,
    Blockie,
    ChainChip,
    AddressChip,
    ContractRow,
    // eslint-disable-next-line vue/no-unused-components
    AddContractDialog
  },
  props: {},
  data() {
    return {
      coinbase: null,
      chain: null,
      contracts: []
    };
  },
  computed: {
    languages() {
      return this.$i18n.availableLocales.map(code => code.toUpperCase());
    },
    connected() {
      return this.coinbase !== null && this.chain !== null;
    }
  },
  watch: {
    allContracts: {
      deep: true,
      handler: newContracts => {
        localStorage.contracts = JSON.stringify(newContracts);
      }
    }
  },
  methods: {
    // accountChanged(e) {
    accountChanged() {
      //      this.coinbase = e.coinbase;
      this.coinbase = '0xa44aad4cf0fb0d4940c6cf215977c9cd55340f42';
      this.loadContracts();
    },
    chainChanged(e) {
      this.chain = e.chain;
      this.loadContracts();
    },
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
          console.log(data);
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
            this.$notify('Contract not found');
          } else {
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
