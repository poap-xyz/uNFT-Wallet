<script>
/* eslint @intlify/vue-i18n/no-missing-keys: 'off' */
function mergeLocaleMessages(i18n, messages) {
  for (const locale of Object.keys(messages)) {
    i18n.mergeLocaleMessage(locale, messages[locale]);
  }
}
const i18nMessages = {
  en: {
    pleaseAprove: 'Please aprove the transaction',
    transactionSent: 'Transaction Sent',
    transactionConfirmed: 'Transaction Confirmed',
  },
  es: {
    pleaseAprove: 'Favor de aprovar la transacción',
    transactionSent: 'Transacción enviada',
    transactionConfirmed: 'Transacción Confirmada',
  },
};

export default {
  emits: ['ok', 'hide', 'transferConfirmed', 'transferSent'],
  beforeCreate() {
    mergeLocaleMessages(this.$i18n, i18nMessages);
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
    transactionReceipt(message) {
      this.$$emit('transferConfirmed', {
        // eslint-disable-next-line no-underscore-dangle
        contract: this.contract._address,
        id: this.id,
      });
      this.$q.notify({
        type: 'positive',
        message: message || this.$t('transactionConfirmed'),
      });
    },
    transactionHash(hash) {
      if (this.$q.loading !== undefined) {
        this.$q.loading.hide();
      }
      const actions = [
        {
          label: 'Dismiss',
          color: 'white',
          handler: () => {
            /* ... */
          },
        },
      ];
      if (this.$web3.chains[this.$store.state.web3.chainId].explorerTx) {
        actions.unshift({
          label: 'View',
          color: 'yellow',
          handler: () => {
            window.open(
              this.$web3.chains[
                this.$store.state.web3.chainId
              ].explorerTx.replace('%s', hash),
              '_blank'
            );
          },
        });
      }
      this.$q.notify({
        type: 'info',
        icon: 'send',
        message: this.$t('transactionSent'),
        actions,
      });
      this.$$emit('transferSent', {
        // eslint-disable-next-line no-underscore-dangle
        contract: this.contract._address,
        id: this.id,
        amount: this.amount,
      });
    },
    transactionError(err) {
      this.$q.loading.hide();
      this.$q.notify({
        type: 'negative',
        message: `Error: ${err.message}`,
      });
    },
    alertAprove() {
      this.$q.loading.show({
        backgroundColor: 'black',
        message: this.$t('pleaseAprove'),
      });
    },
  },
};
</script>
