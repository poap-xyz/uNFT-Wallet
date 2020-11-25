<i18n lang="yaml">
en:
  properties: "Properties"
  transfer: "Transfer"
es:
  properties: "Propiedades"
  transfer: "Transferir"
</i18n>
<template>
  <div v-if="uri">
    <q-card clickable class="token">
      <q-card-section horizontal>
        <q-badge v-if="amount > 0" color="accent" floating>
          {{ amount }}
        </q-badge>
        <img v-if="image" :src="image" @error="imageError" />
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

        <q-card-section class="q-pt-none"> ID: {{ id }} </q-card-section>

        <q-card-section class="q-pt-none">
          <vue-json-pretty :data="properties"> </vue-json-pretty>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Close" color="primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import TransferDialog from './TransferDialog';

function handleDecentralizedProtocols(url) {
  const urlUrl = new URL(url);
  const { protocol, pathname } = urlUrl;

  const cleanProtocol = protocol.slice(0, -1);
  let cleanPathname = pathname.slice(2);

  if (cleanProtocol === 'ipfs') {
    if (cleanPathname.indexOf('ipfs') === 0) {
      cleanPathname = cleanPathname.slice(5);
    }
    return `https://ipfs.io/ipfs/${cleanPathname}`;
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
    uri: {
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
      avalilableLocales: [],
      fixedImage: false,
      fixedCORS: false,
      fixedCORSImage: false,
      badCORSHosts: ['cdn.enjin.io']
    };
  },
  watch: {
    '$i18n.locale': function(locale) {
      if (this.avalilableLocales.includes(locale)) {
        this.load();
      }
    }
  },
  created() {
    if (this.uri) {
      this.load();
    } else {
      console.log(
        // eslint-disable-next-line no-underscore-dangle
        `Empty URI for Contract: ${this.contract._address} ID: ${this.id}`
      );
    }
  },
  methods: {
    load() {
      const handledUri = this.handleBadCORS(
        handleIdExpansion(
          handleDecentralizedProtocols(this.uri),
          this.id,
          this.$web3.instance.utils.BN
        )
      );
      this.$axios
        .get(handledUri)
        .then(response => {
          if (response.data.localization) {
            this.avalilableLocales = response.data.localization.locales;
          }
          if (
            response.data.localization &&
            this.$i18n.locale !== response.data.localization.default &&
            response.data.localization.locales.includes(this.$i18n.locale)
          ) {
            const handledLocaleUri = this.handleBadCORS(
              handleLocaleExpansion(
                handleIdExpansion(
                  handleDecentralizedProtocols(response.data.localization.uri),
                  this.id
                ),
                this.$i18n.locale
              )
            );

            this.$axios.get(handledLocaleUri).then(localeResponse => {
              this.name = localeResponse.data.name || response.data.name;
              this.description =
                localeResponse.data.description || response.data.description;
              if (localeResponse.data.image) {
                this.image = this.handleBadCORS(
                  handleDecentralizedProtocols(localeResponse.data.image)
                );
              } else if (response.data.image) {
                this.image = this.handleBadCORS(
                  handleDecentralizedProtocols(response.data.image)
                );
              } else {
                this.image = 'https://via.placeholder.com/200';
              }
              this.properties =
                localeResponse.data.properties || response.data.properties;
            });
          } else {
            this.name = response.data.name;
            this.description = response.data.description;
            if (response.data.image) {
              this.image = this.handleBadCORS(
                handleDecentralizedProtocols(response.data.image)
              );
            } else {
              this.image = 'https://via.placeholder.com/200';
            }

            this.properties = response.data.properties;
          }
        })
        .catch(err => {
          if (typeof err.response === 'undefined' && !this.fixedCORS) {
            const url = new URL(this.uri);
            this.badCORSHosts.push(url.host);
            this.fixedCORS = true;
            this.load();
          }
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
          this.$emit('transfer');
        });
    },
    handleBadCORS(url) {
      const urlUrl = new URL(url);
      const { host } = urlUrl;

      if (this.badCORSHosts.includes(host)) {
        return `https://cors-anywhere.herokuapp.com/${url}`;
      }

      return url;
    },
    imageError() {
      if (!this.fixedImage) {
        this.$axios.get(this.image, { responseType: 'blob' }).then(response => {
          const reader = new FileReader();
          reader.readAsDataURL(response.data);
          reader.onloadend = () => {
            const base64String = reader.result;
            this.image = base64String;
          };
        });
        this.fixedImage = true;
      }
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
