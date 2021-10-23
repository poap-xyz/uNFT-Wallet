<script>
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
  methods: {
    async validateRecipient(recipient) {
      let isOK = false;
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
      return 'Invalid address';
    },
  },
};
</script>
