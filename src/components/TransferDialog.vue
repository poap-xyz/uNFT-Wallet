<i18n lang="yaml">
en:
  transferToken: "Transfer Token"
  recipient: "Recipient"
  addressOrENS: "Address or ENS"
  address: "Address"
  amount: "Amount"
  submit: "Submit"
  reset: "Reset"
  validations:
    typeAmount: "Type an amount"
    typeAmountGtZero: "Type an amount greater than zero"

es:
  transferToken: "Transferir Token"
  recipient: "Receptor"
  addressOrENS: "Dirección o ENS"
  address: "Dirección"
  amount: "Cantidad"
  submit: "Enviar"
  reset: "Borrar"
  validations:
    typeAmount: "Escribe una cantidad"
    typeAmountGtZero: "Escribe una cantidad mayor a cero"

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
            v-model="amount"
            filled
            type="number"
            :label="$t('amount')"
            lazy-rules
            :rules="[
              val =>
                (val !== null && val !== '') || $t('validations.typeAmount'),
              val => val > 0 || $t('validations.typeAmountGtZero')
            ]"
          />

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
  name: 'MintDialog',
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
    async transfer() {
      const estimatedGas = await this.contract.methods
        .safeTransferFrom(
          this.coinbase,
          this.recipientAddress,
          this.id,
          this.amount,
          0
        )
        .estimateGas({ from: this.coinbase });

      this.$q.loading.show({
        message: this.$t('common.transactions.aprove')
      });
      this.contract.methods
        .safeTransferFrom(
          this.coinbase,
          this.recipientAddress,
          this.id,
          this.amount,
          0
        )
        .send({ gas: estimatedGas, from: this.coinbase })
        .on('transactionHash', hash => {
          console.log(hash);
          this.$q.loading.show({
            message: this.$t('common.transactions.waiting')
          });
        })
        .on('confirmation', confirmationNumber => {
          console.log(confirmationNumber);
        })
        .on('receipt', () => {
          this.$q.loading.hide();
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'send',
            message: 'Transfer Sent'
          });
          this.reset();
          this.onOKClick();
        })
        .on('error', err => {
          console.log(err);
        });
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
