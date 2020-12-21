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
    <q-card v-if="description === '' && name === ''" class="token ">
      <q-card-section horizontal>
        <q-skeleton class="imageSkeleton" square />
        <q-card-section>
          <div class="text-h6 q-mb-xs name">
            <q-skeleton v-if="state === 'OK'" type="text" />
            <div v-else>{{ state }}</div>
          </div>
          <div class="q-mb-xs description">
            <q-skeleton type="text" />
            <q-skeleton type="text" />
            <q-skeleton type="text" />
          </div>
        </q-card-section>
      </q-card-section>
      <q-card-actions align="around">
        <q-skeleton type="QBtn" />
        <q-skeleton type="QBtn" />
      </q-card-actions>
    </q-card>
    <q-card
      v-else
      clickable
      class="token "
      :class="{ disabled: pendingTransferNoneLeft }"
    >
      <q-card-section horizontal>
        <q-badge v-if="type === 'ERC1155'" color="accent" floating>
          {{ amount }}
          <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
          <span v-if="pendingTransferAmount > 0">
            –{{ pendingTransferAmount }}
          </span>
        </q-badge>
        <img
          v-if="image"
          :src="image"
          class="tokenImage"
          :class="{ empty: imageLoaded }"
          @loaded="imageLoaded = true"
          @error="imageError"
        />
        <q-card-section>
          <div class="text-h6 q-mb-xs name" :title="name">{{ name }}</div>
          <div class="q-mb-xs description" :title="description">
            {{ description }}
          </div>
        </q-card-section>
      </q-card-section>
      <q-card-actions align="around">
        <q-btn flat @click="propertiesDialog = true">{{
          $t('properties')
        }}</q-btn>
        <q-btn
          flat
          :disabled="pendingTransferNoneLeft"
          @click="showTransferDialog"
        >
          {{ $t('transfer') }}</q-btn
        >
      </q-card-actions>
    </q-card>

    <q-dialog v-model="propertiesDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('properties') }}</div>
        </q-card-section>

        <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
        <q-card-section class="q-pt-none">0x{{ hexId }} </q-card-section>

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

function handleIdExpansion(url, hexId) {
  return url.replace('{id}', hexId);
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
    type: {
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
      hexId: '',
      image: null,
      properties: null,
      propertiesDialog: false,
      avalilableLocales: [],
      fixedImage: false,
      fixedCORS: false,
      fixedCORSImage: false,
      badCORSHosts: ['cdn.enjin.io', 'forgottenartifacts.io'],
      imageLoaded: false,
      state: 'OK',
      pendingTransferNoneLeft: false,
      pendingTransferAmount: 0
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
    const bn = new this.$web3.instance.utils.BN(this.id);
    const hexId = bn.toString(16);
    this.hexId = hexId.padStart(64, '0');
    this.load();
  },
  methods: {
    load() {
      const handledUri = this.handleBadCORS(
        handleIdExpansion(handleDecentralizedProtocols(this.uri), this.hexId)
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
                this.image = handleDecentralizedProtocols(
                  localeResponse.data.image
                );
              } else if (response.data.image) {
                this.image = handleDecentralizedProtocols(response.data.image);
              } else {
                this.image = 'https://via.placeholder.com/200';
              }
              this.properties =
                localeResponse.data.properties || response.data.properties;
            });
          } else {
            this.name = response.data.name;
            this.description = response.data.description;
            if (response.data.image || response.data.image_url) {
              this.image = handleDecentralizedProtocols(
                response.data.image || response.data.image_url
              );
            } else {
              this.image = 'https://via.placeholder.com/200';
            }

            this.properties = response.data.properties;
          }
        })
        .catch(err => {
          if (typeof err.response === 'undefined') {
            if (!this.fixedCORS) {
              const url = new URL(this.uri);
              this.badCORSHosts.push(url.host);
              this.fixedCORS = true;
              this.load();
            } else {
              this.state = 'Network error';
            }
          } else if (err.response.status >= 400 && err.response.status <= 503) {
            this.state = 'Remote server error';
          }
        });
    },
    showTransferDialog() {
      this.$root.$on('transferSent', this.transferSent);
      this.$q
        .dialog({
          component: TransferDialog,
          parent: this,
          coinbase: this.coinbase,
          contract: this.contract,
          id: this.id,
          type: this.type,
          currentAmount: this.amount
        })
        .onOk(() => {
          this.$root.$on('transferConfirmed', this.transferConfirmed);
        });
    },
    transferConfirmed(ev) {
      // eslint-disable-next-line no-underscore-dangle
      if (ev.contract === this.contract._address && ev.id === this.id) {
        this.pendingTransferAmount = 0;
        this.$emit('transfer');
        this.$root.$off('transferConfirmed');
      }
    },
    transferSent(ev) {
      // eslint-disable-next-line no-underscore-dangle
      if (ev.contract === this.contract._address && ev.id === this.id) {
        if (this.amount - ev.amount <= 0 || this.type === 'ERC721') {
          this.pendingTransferNoneLeft = true;
        } else {
          this.pendingTransferAmount = ev.amount;
        }
      }
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
      } else {
        this.image = 'https://via.placeholder.com/200';
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
.token .tokenImage {
  max-height: 180px;
}
.token .tokenImage .empty {
  height: 180px;
  width: 180px;
}

.token .imageSkeleton {
  height: 180px;
  width: 180px;
}

.name .q-skeleton {
  width: 220px;
}

.name {
  -webkit-line-clamp: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.description .q-skeleton:nth-of-type(1) {
  width: 200px;
}
.description .q-skeleton:nth-of-type(2) {
  width: 230px;
}
.description .q-skeleton:nth-of-type(3) {
  width: 180px;
}

.description {
  -webkit-line-clamp: 5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
</style>
