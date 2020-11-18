<i18n lang="yaml">
en:
  addContract: "Add Contract"
  connect: "Connect"
  logout: "Logout"
  changeAccount: "Change Account"
  deleteContract: "Delete Contract"
  deleteContractMessage: "Do you wish to delete {alias}?"

es:
  addContract: "Agregar Contrato"
  connect: "Conectar"
  logout: "Salir"
  changeAccount: "Cambiar Cuenta"
  deleteContract: "Borrar contrato"
  deleteContractMessage: "¿Deseas borrar {alias}?"

</i18n>
<template>
  <div>
    <LanguageChanger :languages="languages" />
    <ChainChip />
    <div v-if="coinbase != ''">
      <q-btn v-if="connected" round flat>
        <Blockie :address="coinbase"></Blockie>
        <!--<q-menu>-->
        <!--<q-list style="min-width: 100px">-->
        <!--<q-item v-close-popup clickable @click="logout">-->
        <!--<q-item-section>{{ $t('logout') }}</q-item-section>-->
        <!--</q-item>-->
        <!--<q-item v-close-popup clickable @click="changeAccount">-->
        <!--<q-item-section>{{ $t('changeAccount') }}</q-item-section>-->
        <!--</q-item>-->
        <!--</q-list>-->
        <!--</q-menu>-->
      </q-btn>
      <div class="row">
        <div class="col-xs-8">
          <span class="truncate-chip-labels">
            <BlockchainChip :address="coinbase" />
          </span>
        </div>
      </div>
      <ContractRow
        v-for="contract in contracts"
        v-bind:key="contract.address"
        :address="contract.address"
        :alias="contract.alias"
        :lastScanBlock="contract.lastScanBlock"
        :coinbase="coinbase"
        :chain="chain"
        @delete="onDeleteContract"
        @scan="onScanContract"
      >
      </ContractRow>
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
    <div v-else>
      <!--<Web3Modal> </Web3Modal>-->
      <q-btn @click="connect">{{ $t('connect') }}</q-btn>
    </div>
  </div>
</template>

<script>
import ContractRow from '../components/ContractRow.vue';
import Web3Modal from '../components/Web3Modal.vue';
import BlockchainChip from '../components/BlockchainChip.vue';
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
  if (contractCode == '0x') {
    console.error('Contract ' + contractAddress + ' does not exist!');
    return -1;
  }

  while (lowestBlock <= highestBlock) {
    let searchBlock = parseInt((lowestBlock + highestBlock) / 2);
    contractCode = await web3.eth.getCode(contractAddress, searchBlock);

    if (contractCode != '0x') {
      highestBlock = searchBlock;
    } else if (contractCode == '0x') {
      lowestBlock = searchBlock;
    }

    if (highestBlock == lowestBlock + 1) {
      return highestBlock;
    }
  }
}

export default {
  name: 'MyVouchers',
  components: {
    //    Web3Modal,
    LanguageChanger,
    Blockie,
    ChainChip,
    BlockchainChip,
    ContractRow,
    // eslint-disable-next-line vue/no-unused-components
    AddContractDialog
  },
  props: {},
  async mounted() {
    if (localStorage.lastAddress) {
      await this.connect();
    }
    // Debugging:
    //    if (localStorage.contracts) {
    //      this.allContracts = JSON.parse(localStorage.contracts);
    //}
  },
  data() {
    return {
      tc: 'pages.myVouchers.',
      connected: true,
      from_addr: '',
      to_addr: '',
      contract: {},
      name: '',
      description: '',
      profilePicture: '',
      instagram: '',
      singleInbound: [],
      singleOutbound: [],
      loadedEvents: false,
      coinbase: '',
      chain: 31337,
      contracts: []
    };
  },
  computed: {
    languages: function() {
      return this.$i18n.availableLocales.map(code => code.toUpperCase());
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
    async connect() {
      this.coinbase = (await window.ethereum.enable())[0];
      localStorage.lastAddress = this.coinbase;
      this.contracts = await idb.getContracts(this.chain, this.coinbase);
    },
    async showAddContractDialog() {
      this.$q
        .dialog({
          component: AddContractDialog,
          parent: this,
          existing: this.contracts
        })
        .onOk(async data => {
          let allContracts = { ...this.allContracts };
          const blockCreated = await searchContractCretionBlock(
            this.$web3.instance,
            data.address
          );
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
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
