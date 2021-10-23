<i18n lang="yaml">
en:
  multitransferToken: 'Transfer Multiple Tokens'
  recipient: 'Recipient'
  addressOrENS: 'Address or ENS'
  address: 'Address'
  reset: 'Reset'
  transfer: 'Transfer'
  approve: 'Approve'
  approvalSuccesful: 'Approval Successful'
  alreadyApproved: 'This contract is already approved'
  confirmation: 'Confirmation:'
  confirmationValidationError: 'You must confirm the number of NFTs'
  toTransfer: 'NFTs are going to be transfered'

es:
  multitransferToken: 'Transferir Multiples Tokens'
  recipient: 'Receptor'
  addressOrENS: 'Dirección o ENS'
  address: 'Dirección'
  reset: 'Borrar'
  transfer: 'Transferir'
  approve: 'Aprovar'
  approvalSuccesful: 'Aprobación Exitosa'
  alreadyApproved: 'Este contrato ya está aprobado'
  confirmation: 'Confirmación:'
  confirmationValidationError: 'Debes confirmar el número de NFTs'
  toTransfer: 'NFTs se van a transferir'
</i18n>

<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card>
      <q-toolbar>
        <q-toolbar-title>{{ $t('multitransferToken') }}</q-toolbar-title>

        <q-btn v-close-popup flat round dense icon="close" />
      </q-toolbar>

      <q-card-section class="avatar-section">
        <q-avatar v-if="recipientAddress !== null">
          <blockie :address="recipientAddress"></blockie>
        </q-avatar>
      </q-card-section>
      <q-card-section>
        <q-form
          ref="form"
          class="q-gutter-md"
          @submit="transfer"
          @reset="reset"
        >
          <q-input
            v-model="recipient"
            filled
            debounce="500"
            :label="$t('recipient')"
            :hint="$t('addressOrENS')"
            lazy-rules
            :rules="[validateRecipient]"
            color="accent"
          />

          <q-input
            v-if="isENS"
            v-model="recipientAddress"
            filled
            readonly
            :label="$t('address')"
            color="accent"
          />

          <q-input
            v-if="reverseENS"
            v-model="reverseENS"
            filled
            readonly
            label="ENS"
            color="accent"
          />
          <div class="row confirmation">{{ $t('confirmation') }}</div>
          <q-field
            ref="toggle"
            :value="checkmark"
            :rules="[userHasVerified]"
            borderless
            dense
          >
            <template #control>
              <q-checkbox
                v-model="checkmark"
                color="positive"
                dense
                :label="count + ' ' + $t('toTransfer')"
              >
              </q-checkbox>
            </template>
          </q-field>
          <div class="row justify-end q-card__actions">
            <div v-if="isApproved" class="approvedInfo">
              {{ $t('alreadyApproved') }}
            </div>
            <q-btn
              :label="$t('approve')"
              :loading="isApproved === null || approvalTxPending"
              :disable="isApproved"
              color="positive"
              @click="multitransferApproval"
            />
          </div>
          <q-card-actions align="right">
            <q-btn
              :label="$t('reset')"
              type="reset"
              color="accent"
              flat
              class="q-ml-sm"
            />
            <q-btn
              :label="$t('transfer')"
              :loading="isApproved === null"
              :disable="!isApproved"
              type="submit"
              color="accent"
            />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import Blockie from './Blockie';
import TransactionModal from '../mixins/TransactionModal';
import RecipientUtils from '../mixins/RecipientUtils';
import abiMultitransfer from '../artifacts/multitransfer721.abi.json';

const MULTITRANSFER_CONTRACT = '0x90dd0178E80040F6a7A6EBdECBE71CB3FA516472';

export default {
  name: 'MultitransferDialog',
  components: {
    blockie: Blockie,
  },
  mixins: [TransactionModal, RecipientUtils],
  props: {
    coinbase: {
      type: String,
      required: true,
    },
    contract: {
      type: Object,
      required: true,
    },
    tokenIds: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      recipient: null,
      isENS: false,
      reverseENS: false,
      recipientAddress: null,
      checkmark: false,
      isApproved: null,
      approvalTxPending: false,
    };
  },
  computed: {
    count() {
      return this.tokenIds.length;
    },
    submitLabel() {
      return this.isApproved ? this.$t('transfer') : this.$t('approve');
    },
  },
  async created() {
    this.isApproved = await this.checkAproval();
  },
  methods: {
    userHasVerified() {
      return this.checkmark ? true : this.$t('confirmationValidationError');
    },
    reset() {
      this.recipient = null;
      this.amount = null;
      this.recipientAddress = null;
      this.isENS = false;
      this.checkmark = null;
    },
    transfer() {
      this.$refs.form.resetValidation();
      this.$refs.form.validate().then((isValid) => {
        if (isValid) {
          if (this.isApproved) {
            this.multitransfer();
          } else {
            this.multitransferApproval();
          }
        }
      });
    },
    async checkAproval() {
      return this.contract.methods
        .isApprovedForAll(this.coinbase, MULTITRANSFER_CONTRACT)
        .call();
    },
    async multitransfer() {
      this.alertAprove();
      let gas = 500000;
      const contract = new this.$web3.instance.eth.Contract(
        abiMultitransfer,
        MULTITRANSFER_CONTRACT
      );
      try {
        gas = await contract.methods
          .multitransfer(
            // eslint-disable-next-line no-underscore-dangle
            this.contract._address,
            this.recipientAddress,
            this.tokenIds
          )
          .estimateGas({ from: this.coinbase });
        gas = Math.floor(gas * 1.3);
      } catch (err) {
        this.transactionError(err);
        return;
      }

      contract.methods
        .multitransfer(
          // eslint-disable-next-line no-underscore-dangle
          this.contract._address,
          this.recipientAddress,
          this.tokenIds
        )
        .send({ from: this.coinbase, gas })
        .on('error', (err) => {
          this.transactionError(err);
        })
        .on('transactionHash', this.transactionHash)
        .on('transactionHash', this.onOKClick)
        .on('receipt', this.transactionReceipt);
    },
    async multitransferApproval() {
      try {
        const isApproved = await this.checkAproval();
        if (!isApproved) {
          this.alertAprove();
          let gas = 500000;
          try {
            gas = await this.contract.methods
              .setApprovalForAll(MULTITRANSFER_CONTRACT, true)
              .estimateGas({ from: this.coinbase });
            gas = Math.floor(gas * 1.3);
          } catch (err) {
            this.transactionError(err);
          }

          this.contract.methods
            .setApprovalForAll(MULTITRANSFER_CONTRACT, true)
            .send({ from: this.coinbase, gas })
            .on('error', (err) => {
              this.transactionError(err);
            })
            .on('transactionHash', (hash) => {
              this.transactionHash(hash);
              this.approvalTxPending = true;
            })
            .on('receipt', (receipt) => {
              this.approvalTxPending = false;
              if (receipt && receipt.status) {
                this.isApproved = true;
                this.transactionReceipt(this.$t('approvalSuccesful'));
              }
            });
        } else {
          this.isApproved = true;
          this.$q.notify({
            type: 'warning',
            message: this.$t('alreadyApproved'),
          });
        }
      } catch (err) {
        this.transactionError(err);
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.avatar-section {
  padding: 0;
  text-align: center;
}
.confirmation {
  font-size: 1.3em;
}
.approvedInfo {
  margin-right: 5px;
}
</style>
