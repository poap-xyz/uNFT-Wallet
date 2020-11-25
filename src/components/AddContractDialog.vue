<i18n lang="yaml">
en:
  addContract: "Add Contract"
  address: "Address"
  alias: "Alias"
  invalidAddress: "Invalid address"
  notERC1155: "Address is not a ERC1155 Contract"
  add: "Add"
  reset: "Reset"
  alreadyExists: "This address already exists as: {alias}"

es:
  addContract: "Agregar Contrato"
  address: "Dirección"
  alias: "Alias"
  invalidAddress: "Dirección inválida"
  notERC1155: "La dirección no es un contrato ERC1155"
  add: "Agregar"
  reset: "Borrar"
  alreadyExists: "Esta dirección ya existe como: {alias}"
</i18n>
<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card>
      <q-toolbar>
        <q-toolbar-title>{{ $t('addContract') }}</q-toolbar-title>

        <q-btn v-close-popup flat round dense icon="close" />
      </q-toolbar>

      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="common" label="Common" />
        <q-tab name="custom" label="Custom" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="common">
          <q-form class="q-gutter-md" @submit="onOKCommon" @reset="reset">
            <q-select
              v-model="commonSelection"
              :options="commonContracts"
              option-label="name"
              label="Contract"
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

export default {
  name: 'AddContractDialog',
  props: {
    existing: {
      type: Array,
      required: false,
      default: () => []
    },
    chain: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      address: null,
      alias: null,
      tab: 'common',
      commonSelection: null
    };
  },
  computed: {
    commonContracts() {
      return knownContracts[this.chain.toString()];
    }
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
      this.$emit('ok', { address: this.address, alias: this.alias });
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
        blockCreated: this.commonSelection.block
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
          .map(contract => contract.address)
          .indexOf(address);

        if (index >= 0) {
          result = this.$t('alreadyExists', {
            alias: this.existing[index].alias
          });
        } else {
          const contract = new this.$web3.instance.eth.Contract(ABI, address);
          await contract.methods
            .supportsInterface('0xd9b67a26') // ERC1155 Standard
            .call()
            .then(isERC1155 => {
              if (isERC1155) {
                result = true;
              } else {
                result = this.$t('notERC1155');
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
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
