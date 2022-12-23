<i18n>
</i18n>
<script>
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

function mergeLocaleMessages(i18n, messages) {
  Object.entries(messages).forEach(([locale, localeMessages]) =>
    i18n.mergeLocaleMessage(locale, localeMessages)
  );
}

export default {
  name: 'RecipientUtils',
  data() {
    return {
      recipient: null,
      isENS: false,
      reverseENS: false,
      recipientAddress: null,
    };
  },
  beforeCreate() {
    mergeLocaleMessages(this.$i18n, {
      en: {
        invalidAddress: 'Invalid Address',
        transferingToNull:
          "The NFT standards don't allow transfering to the Null address, you can still try, or send to 0x000000000000000000000000000000000000dead",
      },
      es: {
        invalidAddress: 'Dirección invalida',
        transferingToNull:
          'Los estandares de NFTs no permiten transferir a la dirección Null, lo puedes intentar, o enviar a 0x000000000000000000000000000000000000dead',
      },
    });
  },
  methods: {
    async validateRecipient(recipient) {
      let isOK = false;
      if (recipient === NULL_ADDRESS) {
        return this.$t('transferingToNull');
      }
      if (this.$web3.instance.utils.isAddress(recipient)) {
        this.isENS = false;
        this.recipientAddress = recipient;
        isOK = true;
        this.$web3.ens
          .getName(this.recipientAddress)
          .then(async (name) => {
            this.$web3.ens
              .name(name.name)
              .getAddress()
              .then((forwardAddress) => {
                if (this.recipientAddress === forwardAddress) {
                  this.reverseENS = name.name;
                }
              });
          })
          .catch(() => {});
      }
      // 3 letter domain + 3 letter tld + period
      if (!isOK && recipient.length >= 7) {
        await this.$web3.ens
          .name(recipient)
          .getAddress()
          .then((address) => {
            if (address !== '0x0000000000000000000000000000000000000000') {
              this.isENS = true;
              this.recipientAddress = address;
              isOK = true;
            }
          })
          .catch(() => {
            this.isENS = false;
            this.recipientAddress = null;
          });
      }

      if (isOK) {
        return true;
      }
      return this.$t('invalidAddress');
    },
  },
};
</script>
