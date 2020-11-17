<template>
  <div>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Vouchers" to="../" />
        <q-breadcrumbs-el :label="voucher.name" />
      </q-breadcrumbs>
    </div>

    <div class="q-pa-md row items-start q-gutter-md">
      <q-card class="detailed-voucher-card">
        <q-badge v-if="amount > 0" color="accent" floating>
          {{ amount }}
        </q-badge>
        <q-card-section horizontal>
          <q-card-section class="col-5 flex flex-center">
            <q-img class="rounded-borders" :src="image" />
          </q-card-section>
          <q-card-section class="q-pt-xs">
            <div class="text-h5 q-mt-sm q-mb-xs">{{ voucher.name }}</div>
            <div class="" style="white-space: pre-warp">
              {{ voucher.description }}
            </div>
            <q-item>
              <q-item-section avatar>
                <q-icon name="fa fa-calendar" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t(tc + 'expiration') }}</q-item-label>
                <q-item-label caption>
                  <span v-if="voucher.properties.expires">{{
                    voucher.properties.expirationDate
                  }}</span>
                  <span v-else>{{ $t(tc + 'expirationNever') }}</span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="fa fa-percent" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t(tc + 'discount') }}</q-item-label>
                <q-item-label caption>
                  <span v-if="voucher.properties.isDiscount">
                    <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
                    {{ voucher.properties.discountPercentage }}%</span
                  >
                  <span v-else>{{ $t(tc + 'discountFull') }}</span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="fa fa-archive" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t(tc + 'presentation') }}</q-item-label>
                <q-item-label caption>
                  <span v-if="voucher.properties.isDigital">{{
                    $t(tc + 'presentationDigital')
                  }}</span>
                  <span v-else>{{ $t(tc + 'presentationPhysical') }}</span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="fa fa-globe" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t(tc + 'redemabeIn') }}</q-item-label>
                <q-item-label caption>
                  <span v-if="!voucher.properties.worldwide">{{
                    voucher.properties.locations
                  }}</span>
                  <span v-else>{{ $t(tc + 'worldwide') }}</span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="!voucher.properties.isDigital">
              <q-item-section avatar>
                <q-icon name="fa fa-truck" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t(tc + 'shipping') }}</q-item-label>
                <q-item-label caption>
                  {{ shippingTypes[voucher.properties.shipping] }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="fa fa-language" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t(tc + 'languages') }}</q-item-label>
                <q-item-label caption>
                  <span v-if="!voucher.properties.languageFree">
                    <ul>
                      <li
                        v-for="language in voucher.properties.languages"
                        :key="language"
                      >
                        {{ language }}
                      </li>
                    </ul></span
                  >
                  <span v-else>{{ $t(tc + 'languagesAny') }}</span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card-section>

        <q-separator />

        <q-card-actions align="around">
          <q-item>
            <q-item-section avatar>
              <q-icon color="primary" name="fas fa-certificate" />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ supply }}</q-item-label>
              <q-item-label caption>{{ $t('common.available') }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon color="red" name="fas fa-burn" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ burned }}</q-item-label>
              <q-item-label caption>{{ $t('common.redeemed') }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="amount > 0">
            <q-item-section>
              <q-btn color="accent" @click="burnModal = !burnModal">{{
                $t('common.actions.redeem')
              }}</q-btn>
            </q-item-section>
          </q-item>
        </q-card-actions>
      </q-card>
    </div>
    <q-dialog v-model="burnModal">
      <q-card>
        <q-toolbar>
          <q-toolbar-title>{{
            $t('common.actions.redeemVoucher')
          }}</q-toolbar-title>

          <q-btn v-close-popup flat round dense icon="close" />
        </q-toolbar>

        <q-card-section>
          <q-form class="q-gutter-md" @submit="burn" @reset="burnReset">
            <q-input
              v-model="burnAmount"
              filled
              type="number"
              label="Amount"
              lazy-rules
              :rules="[
                (val) =>
                  (val !== null && val !== '') || 'Please type an amount',
                (val) => val > 0 || 'Please type a number greater than 0',
                (val) =>
                  val <= amount ||
                  `You can redeem a maximum of ${amount} vouchers`,
              ]"
            />

            <div>
              <q-btn label="Submit" type="submit" color="primary" />
              <q-btn
                label="Reset"
                type="reset"
                color="primary"
                flat
                class="q-ml-sm"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-page-sticky
      v-if="coinbase == ownerAddress"
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn fab color="accent" icon="send" @click="showMintDialog" />
    </q-page-sticky>
  </div>
</template>

<script>
import {mapState} from 'vuex';
import Voucher from '../artifacts/Voucher.json';
import Store from '../artifacts/Store.json';
import MintDialog from './MintDialog.vue';

export default {
  name: 'VoucherDetail',
  data() {
    return {
      tc: 'components.voucherDetail.',
      recipient: null,
      image: '',
      address: '',
      id: null,
      voucher: {properties: {expires: null}},
      minted: 0,
      burned: 0,
      shippingTypes: {
        included: 'Included',
        extra: 'Extra',
        complex: 'See description',
      },
      ownerAddress: null,
      mintModal: false,
      burnModal: false,
      voucherContract: {},
      amount: 0,
      burnAmount: 0,
    };
  },
  computed: {
    ...mapState('web3', ['coinbase']),
    // eslint-disable-next-line object-shorthand
    supply: function () {
      return this.minted - this.burned;
    },
  },
  watch: {
    // eslint-disable-next-line object-shorthand
    coinbase: function () {
      this.refreshAmounts();
    },
  },
  created() {
    this.voucherId = this.$route.params.voucherId;
    this.storeId = this.$route.params.storeId;
    this.voucherContract = new this.$web3.instance.eth.Contract(
      Voucher.abi,
      process.env.VOUCHER_ADDRESS
    );
    this.voucherContract.methods
      .voucherStore(this.voucherId)
      .call()
      .then((realStoreId) => {
        if (this.storeId !== realStoreId) {
          this.$router.push('/404');
        }
      });
    this.voucherContract.methods
      .uri(this.voucherId)
      .call()
      .then((uri) => {
        const hash = uri.substr(7);
        this.$ipfs.getJson(hash).then(async (response) => {
          this.voucher = response;
          const imageHash = response.image.substr(7);
          this.image = await this.$ipfs.getImage(imageHash);
        });
      });
    const storeContract = new this.$web3.instance.eth.Contract(
      Store.abi,
      process.env.STORE_ADDRESS
    );
    storeContract.methods
      .ownerOf(this.storeId)
      .call()
      .then((ownerAddress) => {
        this.ownerAddress = ownerAddress;
      });
    this.refreshAmounts();
  },

  methods: {
    async refreshAmounts() {
      this.voucherContract.methods
        .minted(this.voucherId)
        .call()
        .then((amountMinted) => {
          this.minted = amountMinted;
        });
      this.voucherContract.methods
        .burned(this.voucherId)
        .call()
        .then((amountBurned) => {
          this.burned = amountBurned;
        });
      this.voucherContract.methods
        .balanceOf(this.coinbase, this.voucherId)
        .call()
        .then((amount) => {
          this.amount = Number(amount);
        });
    },
    async burn() {
      const estimatedGas = await this.voucherContract.methods
        .burn(this.coinbase, this.voucherId, this.burnAmount)
        .estimateGas({from: this.coinbase});

      this.voucherContract.methods
        .burn(this.coinbase, this.voucherId, this.burnAmount)
        .send({gas: estimatedGas, from: this.coinbase})
        .then(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Redeemed',
          });
          this.burnReset();
          this.burnModal = false;
          this.refreshAmounts();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    burnReset() {
      this.recipient = null;
      this.mintAmount = null;
      this.recipientAddress = null;
      this.isENS = false;
    },
    showMintDialog() {
      this.$q
        .dialog({
          component: MintDialog,
          parent: this,
          voucherId: this.voucherId,
        })
        .onOk(() => {
          this.refreshAmounts();
        });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
