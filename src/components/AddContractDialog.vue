<i18n lang="yaml">
en:
  contract: 'Contract'
  address: 'Address'
  alias: 'Alias'
  invalidAddress: 'Invalid address'
  notSupportedToken: 'Address is not a ERC721 nor ERC1155 Contract'
  add: 'Add'
  reset: 'Reset'
  alreadyExists: 'This address already exists as: {alias}'
  tokenType: 'Type'
  common: 'Common'
  custom: 'Custom'
  advanced: 'Advanced (Optional)'
  startBlock: 'Scan Start'
  startBlockHint: 'The number of the first block in which the account interacted with this contract'

es:
  contract: 'Contrato'
  address: 'Dirección'
  alias: 'Alias'
  invalidAddress: 'Dirección inválida'
  notSupportedToken: 'La dirección no es un contrato ERC721 ni ERC1155'
  add: 'Agregar'
  reset: 'Borrar'
  alreadyExists: 'Esta dirección ya existe como: {alias}'
  tokenType: 'Tipo'
  common: 'Común'
  custom: 'Personalizado'
  advanced: 'Avanzado (Opcional)'
  startBlock: 'Inicio de Busqueda'
  startBlockHint: 'El número del primer bloque en el que la cuenta interactuó con este contrato'
</i18n>

<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card>
      <q-toolbar>
        <q-toolbar-title>{{ $t('add') }} {{ $t('contract') }}</q-toolbar-title>

        <q-btn v-close-popup flat round dense icon="close" />
      </q-toolbar>
      <div class="text-center">
        <chain-chip :chain-id="chainId" :chains="$web3.chains" />
      </div>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="common" :label="$t('common')" />
        <q-tab name="custom" :label="$t('custom')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="common">
          <q-form class="q-gutter-md" @submit="onOKCommon" @reset="reset">
            <q-select
              v-model="commonSelection"
              :options="commonContracts"
              option-label="name"
              :label="$t('contract')"
            />

            <q-input
              v-model="commonSelectionType"
              filled
              :label="$t('tokenType')"
              readonly
            />

            <q-card-actions align="right">
              <q-btn
                :label="$t('reset')"
                type="reset"
                color="primary"
                flat
                class="q-ml-sm"
              />
              <q-btn :label="$t('add')" type="submit" color="primary" />
            </q-card-actions>
          </q-form>
        </q-tab-panel>

        <q-tab-panel name="custom">
          <q-form class="q-gutter-md" @submit="onOKClick" @reset="reset">
            <q-input
              v-model="address"
              filled
              debounce="500"
              :label="$t('address')"
              lazy-rules
              :rules="[validateContractAddress]"
            />

            <q-input v-model="alias" filled :label="$t('alias')" />
            <q-input v-model="type" filled :label="$t('tokenType')" readonly />
            <q-expansion-item dense dense-toggle :label="$t('advanced')">
              <q-input
                v-model.number="startBlock"
                type="number"
                filled
                :label="$t('startBlock')"
                :hint="$t('startBlockHint')"
              />
            </q-expansion-item>

            <q-card-actions align="right">
              <q-btn
                :label="$t('reset')"
                type="reset"
                color="primary"
                flat
                class="q-ml-sm"
              />
              <q-btn :label="$t('add')" type="submit" color="primary" />
            </q-card-actions>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-dialog>
</template>

<script>
import ABI from '../artifacts/ierc1155.abi.json';
import knownContracts from '../knownContracts.json';
import donations from '../donations.json';
import ChainChip from './ChainChip';

export default {
  name: 'AddContractDialog',
  components: { ChainChip },
  props: {
    existing: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  emits: ['ok', 'hide'],
  data() {
    return {
      address: null,
      alias: null,
      type: null,
      tab: 'common',
      commonSelection: null,
      startBlock: null,
    };
  },
  computed: {
    commonContracts() {
      const chainId = this.$store.state.web3.chainId.toString();
      const formatedDonations = donations[chainId]
        ? [
            {
              name: 'uNFTWallet Donations ERC721',
              type: 'ERC721',
              address: donations[chainId].tokens.ERC721.address,
              block: donations[chainId].tokens.ERC721.blockCreated,
            },
            {
              name: 'uNFTWallet Donations ERC1155',
              type: 'ERC1155',
              address: donations[chainId].tokens.ERC1155.address,
              block: donations[chainId].tokens.ERC1155.blockCreated,
            },
          ]
        : [];

      return (knownContracts[chainId] || []).concat(formatedDonations);
    },
    commonSelectionType() {
      if (this.commonSelection) return this.commonSelection.type;
      return null;
    },
    chainId() {
      return this.$store.state.web3.chainId;
    },
  },

  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide');
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      const ev = {
        address: this.address,
        alias: this.alias,
        type: this.type,
      };
      if (this.startBlock && this.startBlock !== '' && this.startBlock > 0) {
        ev.blockCreated = parseInt(this.startBlock, 10) - 1;
      }
      this.$emit('ok', ev);
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onOKCommon() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok', {
        address: this.commonSelection.address,
        alias: this.commonSelection.name,
        blockCreated: this.commonSelection.block,
        type: this.commonSelection.type,
      });
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide dialog
      this.hide();
    },
    async validateContractAddress(address) {
      let result = null;
      if (this.$web3.instance.utils.isAddress(address)) {
        const index = this.existing
          .map((contract) => contract.address)
          .indexOf(address);

        if (index >= 0) {
          result = this.$t('alreadyExists', {
            alias: this.existing[index].alias,
          });
        } else {
          const contract = new this.$web3.instance.eth.Contract(ABI, address);
          await contract.methods
            .supportsInterface('0xd9b67a26') // ERC1155 Standard
            .call()
            .then(async (isERC1155) => {
              if (isERC1155) {
                this.type = 'ERC1155';
                result = true;
              } else {
                await contract.methods
                  .supportsInterface('0x80ac58cd') // ERC721 Standard
                  .call()
                  .then((isERC721) => {
                    if (isERC721) {
                      this.type = 'ERC721';
                      result = true;
                    } else {
                      result = {
                        status: 'error',
                        message: this.$t('notSupportedToken'),
                      };
                    }
                  });
              }
            });
        }
      } else {
        result = this.$t('invalidAddress');
      }
      return result;
    },
    reset() {
      this.address = null;
      this.alias = null;
      this.commonSelection = null;
    },
  },
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
</style>
