<template>
  <div>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Vouchers" to="../" />
      </q-breadcrumbs>
    </div>

    <div v-if="vouchers.length > 0" class="q-pa-md row items-start q-gutter-md">
      <div v-for="(voucher, index) in vouchers" :key="index">
        <VoucherCard :id="voucher" @click.native="viewDetail(voucher)" />
      </div>
    </div>
    <div v-else>
      {{ $t(tc + 'emptyStore') }}

      <div v-if="coinbase == ownerAddress">
        {{ $t(tc + 'emptyStoreOwner') }}
      </div>
    </div>
    <q-page-sticky
      v-if="coinbase == ownerAddress"
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn fab color="accent" to="define" icon="add" />
    </q-page-sticky>
  </div>
</template>

<script>
import {mapState} from 'vuex';
import VoucherCard from './VoucherCard.vue';
import Voucher from '../artifacts/Voucher.json';
import Store from '../artifacts/Store.json';

export default {
  name: 'VoucherList',
  components: {
    VoucherCard,
  },
  props: {},
  data() {
    return {
      tc: 'components.voucherList.',
      from_addr: '',
      to_addr: '',
      vouchers: [],
      name: '',
      description: '',
      profilePicture: '',
      instagram: '',
      storeId: null,
      ownerAddress: null,
      voucherContract: {},
      storeContract: null,
    };
  },
  computed: {
    ...mapState('web3', ['coinbase']),
  },
  created() {
    this.storeId = this.$route.params.storeId;
    const voucherContract = new this.$web3.instance.eth.Contract(
      Voucher.abi,
      process.env.VOUCHER_ADDRESS
    );
    this.voucherContract = voucherContract;
    voucherContract.methods
      .storeVouchers(this.storeId)
      .call()
      .then((vouchers) => {
        this.vouchers = vouchers;
      });
    const storeContract = new this.$web3.instance.eth.Contract(
      Store.abi,
      process.env.STORE_ADDRESS
    );
    this.storeContract = storeContract;
    storeContract.methods
      .ownerOf(this.storeId)
      .call()
      .then((ownerAddress) => {
        this.ownerAddress = ownerAddress;
      });
  },
  methods: {
    viewDetail(voucherId) {
      this.$router.push({
        name: 'voucher',
        params: {storeId: this.storeId, voucherId},
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.profile-picture {
  max-height: 300px;
  max-width: 300px;
}
</style>
