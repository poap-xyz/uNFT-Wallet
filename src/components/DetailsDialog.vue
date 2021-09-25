<i18n lang="yaml">
en:
  details: 'Details'
es:
  details: 'Detalles'
</i18n>

<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card>
      <q-toolbar>
        <q-toolbar-title>{{ $t('details') }}</q-toolbar-title>

        <q-btn v-close-popup flat round dense icon="close" />
      </q-toolbar>
      <TokenDetails
        :hex-id="hexId"
        :name="name"
        :type="type"
        :description="description"
        :contract-address="contract"
        :chain="chain"
        :properties="properties"
        :image="image"
        :image-original="imageOriginal"
        :metadata-uri="metadataURI"
        :metadata-uri-original="metadataURIOriginal"
        :owner="owner"
        :amount="amount"
      />
    </q-card>
  </q-dialog>
</template>
<script>
import TokenDetails from '../components/TokenDetails';

export default {
  name: 'DetailsDialog',
  components: { TokenDetails },
  props: {
    contract: {
      type: String,
      required: true,
    },
    owner: {
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
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    hexId: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    imageOriginal: {
      type: String,
      required: true,
    },
    properties: {
      type: [Array, Object],
      required: true,
    },
    metadataURI: {
      type: String,
      required: true,
    },
    metadataURIOriginal: {
      type: String,
      required: true,
    },
    chain: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      default: null,
    },
  },
  emits: ['ok', 'hide'],
  data() {
    return {
      address: null,
      alias: null,
      tab: 'common',
      commonSelection: null,
    };
  },
  computed: {},
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
      this.$emit('ok', {});
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide dialog
      this.hide();
    },
    share() {
      const temp = document.createElement('textarea');
      temp.value = 'Hola';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
$detail-img-size: 400px;

.q-card {
  width: 85em;
  max-width: 90vw;
  height: 80em;
  max-height: 90vh;
}
</style>
