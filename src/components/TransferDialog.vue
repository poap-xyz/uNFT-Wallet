<i18n lang="yaml">
en:
  transferToken: "Transfer Token"
  recipient: "Recipient"
  addressOrENS: "Address or ENS"
  address: "Address"
  amount: "Amount"
  submit: "Submit"
  reset: "Reset"
  pleaseAprove: "Please aprove the transaction"
  shortMaximum: "Max"
  validations:
    typeAmount: "Type an amount"
    typeAmountGtZero: "Type an amount greater than zero"
    typeAmountLeMax: "The max amount of tokens you can transfer is {currentAmount}"

es:
  transferToken: "Transferir Token"
  recipient: "Receptor"
  addressOrENS: "Dirección o ENS"
  address: "Dirección"
  amount: "Cantidad"
  submit: "Enviar"
  reset: "Borrar"
  pleaseAprove: "Favor de aprovar la transacción"
  shortMaximum: "Max"
  validations:
    typeAmount: "Escribe una cantidad"
    typeAmountGtZero: "Escribe una cantidad mayor a cero"
    typeAmountLeMax: "La cantiad máxima de tokens que puedes transferir es {currentAmount}"

</i18n>

<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card>
      <q-toolbar>
        <q-toolbar-title>{{ $t('transferToken') }}</q-toolbar-title>

        <q-btn v-close-popup flat round dense icon="close" />
      </q-toolbar>

      <q-card-section class="avatar-section">
        <q-avatar color="gray">
          <blockie
            v-if="recipientAddress !== null"
            :address="recipientAddress"
          ></blockie>
        </q-avatar>
      </q-card-section>
      <q-card-section>
        <q-form class="q-gutter-md" @submit="transfer" @reset="reset">
          <q-input
            v-model="recipient"
            filled
            debounce="500"
            :label="$t('recipient')"
            :hint="$t('addressOrENS')"
            lazy-rules
            :rules="[validateRecipient]"
          />

          <q-input
            v-if="isENS"
            v-model="recipientAddress"
            filled
            readonly
            :label="$t('address')"
          />

          <q-input
            v-if="reverseENS"
            v-model="reverseENS"
            filled
            readonly
            label="ENS"
          />

          <q-input
            v-if="type === 'ERC1155'"
            v-model="amount"
            filled
            type="number"
            :label="$t('amount')"
            lazy-rules
            :rules="[
              val =>
                (val !== null && val !== '') || $t('validations.typeAmount'),
              val => val > 0 || $t('validations.typeAmountGtZero'),
              val =>
                val <= currentAmount ||
                $t('validations.typeAmountLeMax', { currentAmount })
            ]"
          >
            <template v-slot:append>
              <q-btn
                outline
                unelevated
                rounded
                color="primary"
                @click="amount = currentAmount"
                >{{ $t('shortMaximum') }}</q-btn
              >
            </template>
          </q-input>

          <q-card-actions align="right">
            <q-btn
              :label="$t('reset')"
              type="reset"
              color="primary"
              flat
              class="q-ml-sm"
            />
            <q-btn :label="$t('submit')" type="submit" color="primary" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import Blockie from './Blockie.vue';

export default {
  name: 'TransferDialog',
  components: {
    blockie: Blockie
  },
  props: {
    coinbase: {
      type: String,
      required: true
    },
    contract: {
      type: Object,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    currentAmount: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      recipient: null,
      amount: 1,
      isENS: false,
      reverseENS: false,
      recipientAddress: null
    };
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
      this.$emit('ok');
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide dialog
      this.hide();
    },
    async validateRecipient(recipient) {
      let isOK = false;
      if (this.$web3.instance.utils.isAddress(recipient)) {
        this.isENS = false;
        this.recipientAddress = recipient;
        isOK = true;
        this.$web3.ens
          .reverse(recipient)
          .name()
          .then(async name => {
            const forwardENS = await this.$web3.ens.resolver(name).addr();
            if (recipient === forwardENS) {
              this.reverseENS = name;
            } else {
              this.reverseENS = false;
            }
          })
          .catch(() => {
            this.reverseENS = false;
          });
      }
      // 3 letter domain + 3 letter tld + period
      if (!isOK && recipient.length >= 7) {
        await this.$web3.ens
          .resolver(recipient)
          .addr()
          .then(address => {
            this.isENS = true;
            this.recipientAddress = address;
            isOK = true;
          })
          .catch(() => {
            this.isENS = false;
            this.recipientAddress = null;
          });
      }

      if (isOK) {
        return true;
      }
      return 'Invalid address';
    },
    reset() {
      this.recipient = null;
      this.amount = null;
      this.recipientAddress = null;
      this.isENS = false;
    },
    transfer() {
      if (this.type === 'ERC1155') {
        this.transfer1155();
      } else {
        this.transfer721();
      }
    },
    transactionReceipt() {
      this.$parent.$parent.$emit('transferConfirmed');
      this.$q.notify({
        type: 'positive',
        message: 'Transaction confirmed'
      });
    },
    transactionHash(hash) {
      this.$q.loading.hide();
      this.$q.notify({
        type: 'info',
        icon: 'send',
        message: 'Transfer Sent',
        actions: [
          {
            label: 'View',
            color: 'yellow',
            handler: () => {
              window.open(`https://etherscan.io/tx/${hash}`, '_blank');
            }
          },
          {
            label: 'Dismiss',
            color: 'white',
            handler: () => {
              /* ... */
            }
          }
        ]
      });
      this.reset();
      this.onOKClick();
    },
    transactionError(err) {
      this.$q.loading.hide();
      this.$q.notify({
        type: 'negative',
        message: `Error: ${err.message}`
      });
    },
    alertAprove() {
      this.$q.loading.show({
        message: this.$t('pleaseAprove')
      });
    },
    async transfer1155() {
      const estimatedGas = await this.contract.methods
        .safeTransferFrom(
          this.coinbase,
          this.recipientAddress,
          this.id,
          this.amount,
          0
        )
        .estimateGas({ from: this.coinbase });

      this.alertAprove();

      this.contract.methods
        .safeTransferFrom(
          this.coinbase,
          this.recipientAddress,
          this.id,
          this.amount,
          0
        )
        .send({ gas: estimatedGas, from: this.coinbase })
        .on('receipt', this.transactionReceipt)
        .on('transactionHash', this.transactionHash)
        .on('error', this.transactionError);
    },
    async transfer721() {
      const estimatedGas = await this.contract.methods
        .safeTransferFrom(this.coinbase, this.recipientAddress, this.id, 0)
        .estimateGas({ from: this.coinbase });

      this.alertAprove();

      this.contract.methods
        .safeTransferFrom(this.coinbase, this.recipientAddress, this.id, 0)
        .send({ gas: estimatedGas, from: this.coinbase })
        .on('receipt', this.transactionReceipt)
        .on('transactionHash', this.transactionHash)
        .on('error', this.transactionError);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.avatar-section {
  padding: 0;
  text-align: center;
}
</style>
