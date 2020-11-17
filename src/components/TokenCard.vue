<i18n lang="yaml">
en:
  properties: "Properties"
  transfer: "Transfer"
es:
  properties: "Propiedades"
  transfer: "Transferir"
</i18n>
<template>
  <div>
    <q-card clickable class="token">
      <q-card-section horizontal>
        <q-badge v-if="amount > 0" color="accent" floating>
          {{ amount }}
        </q-badge>
        <img v-if="image" :src="image" />
        <q-card-section>
          <div class="text-h6 q-mb-xs">{{ name }}</div>
          <div class="q-mb-xs description">{{ description }}</div>
        </q-card-section>
      </q-card-section>
      <q-card-actions align="around">
        <q-btn flat @click="propertiesDialog = true">{{
          $t('properties')
        }}</q-btn>
        <q-btn flat @click="showTransferDialog">{{ $t('transfer') }}</q-btn>
      </q-card-actions>
    </q-card>

    <q-dialog v-model="propertiesDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('properties') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <vue-json-pretty :data="properties"> </vue-json-pretty>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import ABI from '../artifacts/ierc1155.abi.json';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import TransferDialog from './TransferDialog';

function handleDecentralizedProtocols(url) {
  const [protocol, uri] = url.split('://');

  if (protocol === 'ipfs') {
    return 'https://ipfs.io/ipfs/' + uri;
    // return 'https://ipfs.io/' + uri;
  }

  return url;
}

function handleIdExpansion(url, id, BN) {
  const bn = new BN(id);
  const hexId = bn.toString(16);
  const paddedHexId = hexId.padStart(64, '0');
  return url.replace('{id}', paddedHexId);
}

function handleLocaleExpansion(url, locale) {
  return url.replace('{locale}', locale);
}

export default {
  name: 'TokenCard',
  // eslint-disable-next-line vue/no-unused-components
  components: { VueJsonPretty, TransferDialog },
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
    amount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      name: '',
      description: '',
      image: null,
      properties: null,
      propertiesDialog: false,
      avalilableLocales: []
    };
  },
  created() {
    this.load();
  },
  watch: {
    '$i18n.locale'(locale) {
      if (this.avalilableLocales.includes(locale)) {
        this.load();
      }
    }
  },
  methods: {
    load() {
      this.contract.methods
        .uri(this.id)
        .call()
        .then(uri => {
          const handledUri = handleIdExpansion(
            handleDecentralizedProtocols(uri),
            this.id,
            this.$web3.instance.utils.BN
          );
          this.$axios
            //.get('https://cors-anywhere.herokuapp.com/' + handledUri)
            .get(handledUri)
            .then(response => {
              if (response.data.localization) {
                this.avalilableLocales = response.data.localization.locales;
              }
              if (
                response.data.localization &&
                this.$i18n.locale != response.data.localization.default &&
                response.data.localization.locales.includes(this.$i18n.locale)
              ) {
                const handledLocaleUri = handleLocaleExpansion(
                  handleIdExpansion(
                    handleDecentralizedProtocols(
                      response.data.localization.uri
                    ),
                    this.id
                  ),
                  this.$i18n.locale
                );

                this.$axios
                  //.get(                    'https://cors-anywhere.herokuapp.com/' + handledLocaleUri                  )
                  .get(handledLocaleUri)
                  .then(localeResponse => {
                    this.name = localeResponse.data.name || response.data.name;
                    this.description =
                      localeResponse.data.description ||
                      response.data.description;
                    if (localeResponse.data.image) {
                      this.image = handleDecentralizedProtocols(
                        localeResponse.data.image
                      );
                    } else if (response.data.image) {
                      this.image = handleDecentralizedProtocols(
                        response.data.image
                      );
                    } else {
                      this.image = 'https://via.placeholder.com/200';
                    }
                    this.properties =
                      localeResponse.data.properties ||
                      response.data.properties;
                  });
              } else {
                this.name = response.data.name;
                this.description = response.data.description;
                if (response.data.image) {
                  this.image = handleDecentralizedProtocols(
                    response.data.image
                  );
                } else {
                  this.image = 'https://via.placeholder.com/200';
                }

                this.properties = response.data.properties;
              }
            });
        });
    },
    showTransferDialog() {
      this.$q
        .dialog({
          component: TransferDialog,
          parent: this,
          coinbase: this.coinbase,
          contract: this.contract,
          id: this.id
        })
        .onOk(() => {
          this.refreshAmounts();
        });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.token {
  height: 230px;
  width: 500px;
}
.token img {
  max-height: 180px;
}
.description {
  -webkit-line-clamp: 5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
</style>
