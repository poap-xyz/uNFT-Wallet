<i18n lang="yaml">
en:
  details: 'Details'
  description: 'Description'
  share: 'Share'
es:
  details: 'Detalles'
  description: 'Descripción'
  share: 'Compartir'
</i18n>

<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card>
      <q-toolbar>
        <q-toolbar-title>{{ $t('details') }}</q-toolbar-title>

        <q-btn v-close-popup flat round dense icon="close" />
      </q-toolbar>
      <q-card-section :horizontal="$q.screen.gt.xs">
        <q-img
          :src="image || require('./TokenCard/no-image.svg')"
          class="tokenImage"
          contain
        />
        <q-card-section class="content">
          <h3>
            {{ name }}
          </h3>
          <ChainChip :chain-id="chain" :chains="$web3.chains" />
          <q-chip outline>{{ type }}</q-chip>
          <!-- prettier-ignore -->
          <div class="q-mb-xs description"><h6>{{ $t('description') }}</h6>{{ description }}</div>
          <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
          <div>ID: 0x{{ hexId }}</div>

          <div>
            <vue-json-pretty :data="properties"> </vue-json-pretty>
          </div>
        </q-card-section>
      </q-card-section>
      <q-card-actions align="around">
        <q-btn flat @click="share">{{ $t('share') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

import ChainChip from '../components/ChainChip';

export default {
  name: 'DetailsDialog',
  components: { ChainChip, VueJsonPretty },
  props: {
    contract: {
      type: String,
      required: true,
    },
    id: { type: String, required: true },
    type: { type: String, required: true },
    currentAmount: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    hexId: { type: String, required: true },
    image: { type: String, required: true },
    properties: { type: Array, required: true },
    chain: {
      type: Number,
      required: true,
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

.q-img {
  width: $detail-img-size;
  height: $detail-img-size;
  max-width: $detail-img-size;
  max-height: $detail-img-size;
  margin: 20px;
}

.description {
  white-space: break-spaces;
  border: 3px solid var(--q-primary);
  border-radius: 10px;
  margin: 5px 0;
  padding: 5px;
}

h3,
h6 {
  margin-top: 0;
  margin-bottom: 0.3em;
}
</style>
