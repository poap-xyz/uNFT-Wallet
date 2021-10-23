<i18n lang="yaml">
en:
  transferToken: 'Transfer Token'
  recipient: 'Recipient'
  addressOrENS: 'Address or ENS'
  address: 'Address'
  amount: 'Amount'
  submit: 'Submit'
  reset: 'Reset'
  shortMaximum: 'Max'
  sendingMultiple: 'Sending mutiple NFTs to the same address?'
  tryMultitransfer: 'Try Multitransfer'
  validations:
    typeAmount: 'Type an amount'
    typeAmountGtZero: 'Type an amount greater than zero'
    typeAmountLeMax: 'The max amount of tokens you can transfer is {currentAmount}'

es:
  transferToken: 'Transferir Token'
  recipient: 'Receptor'
  addressOrENS: 'Dirección o ENS'
  address: 'Dirección'
  amount: 'Cantidad'
  submit: 'Enviar'
  reset: 'Borrar'
  shortMaximum: 'Max'
  sendingMultiple: '¿Vas a enviar varios NFTs a la misma dirección?'
  tryMultitransfer: 'Prueba Multitransferencia'
  validations:
    typeAmount: 'Escribe una cantidad'
    typeAmountGtZero: 'Escribe una cantidad mayor a cero'
    typeAmountLeMax: 'La cantidad máxima de tokens que puedes transferir es {currentAmount}'
</i18n>

<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card>
      <q-toolbar>
        <q-toolbar-title>{{ $t('transferToken') }}</q-toolbar-title>

        <q-btn v-close-popup flat round dense icon="close" />
      </q-toolbar>

      <q-card-section class="avatar-section">
        <q-avatar v-if="recipientAddress !== null">
          <blockie :address="recipientAddress"></blockie>
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

          <q-input
            v-if="type === 'ERC1155'"
            v-model="amount"
            filled
            type="number"
            :label="$t('amount')"
            color="accent"
            lazy-rules
            :rules="[
              (val) =>
                (val !== null && val !== '') || $t('validations.typeAmount'),
              (val) => val > 0 || $t('validations.typeAmountGtZero'),
              (val) =>
                val <= currentAmount ||
                $t('validations.typeAmountLeMax', { currentAmount }),
            ]"
          >
            <template #append>
              <q-btn
                outline
                unelevated
                rounded
                @click="amount = currentAmount"
                >{{ $t('shortMaximum') }}</q-btn
              >
            </template>
          </q-input>

          <div class="multitransferNudge">
            <p>{{$t('sendingMultiple')}}</p>
            <p>
            {{$t('tryMultitransfer')}}
              <q-icon name="double_arrow" />
            </p>
          </div>
          <q-card-actions align="right">
            <q-btn
              :label="$t('reset')"
              type="reset"
              color="accent"
              flat
              class="q-ml-sm"
            />
            <q-btn :label="$t('submit')" type="submit" color="accent" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import Blockie from './Blockie';
import TransactionModal from '../mixins/TransactionModal';

export default {
  name: 'TransferDialog',
  components: {
    blockie: Blockie,
  },
  mixins: [TransactionModal],
  props: {
    coinbase: {
      type: String,
      required: true,
    },
    contract: {
      type: Object,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    currentAmount: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      recipient: null,
      amount: 1,
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
        .on('transactionHash', this.onOKClick)
        .on('error', this.transactionError);
    },
    async transfer721() {
      const estimatedGas = await this.contract.methods
        .safeTransferFrom(this.coinbase, this.recipientAddress, this.id)
        .estimateGas({ from: this.coinbase })
        .catch((err) => {
          this.transactionError(err);
          throw err;
        });

      this.alertAprove();

      this.contract.methods
        .safeTransferFrom(this.coinbase, this.recipientAddress, this.id)
        .send({ gas: estimatedGas, from: this.coinbase })
        .on('receipt', this.transactionReceipt)
        .on('transactionHash', this.transactionHash)
        .on('transactionHash', this.onOKClick)
        .on('error', this.transactionError);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.avatar-section {
  padding: 0;
  text-align: center;
}
.multitransferNudge {
  padding: 5px;
  border: 1px dashed gray;
  color: gray;

  p {
    margin-bottom: 0px;
  }

  .q-icon{
    font-size: 1.3em;
  }
}
</style>
