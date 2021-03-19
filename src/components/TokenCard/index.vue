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
      <q-card-section :horizontal="$q.screen.gt.xs">
        <q-skeleton class="imageSkeleton" square>
          <div
            v-if="$q.screen.xs"
            class="absolute-bottom text-subtitle1 text-center"
          >
            <div v-if="state !== 'OK'">{{ state }}</div>
          </div>
        </q-skeleton>
        <q-card-section class="content">
          <div v-if="$q.screen.gt.xs" class="text-h6 q-mb-xs name">
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
      class="token"
      :class="{ disabled: pendingTransferNoneLeft }"
    >
      <q-card-section :horizontal="$q.screen.gt.xs">
        <q-img
          :src="image || require('./no-image.svg')"
          class="tokenImage"
          :class="{ empty: imageLoaded }"
          @loaded="imageLoaded = true"
          @error="imageError"
        >
          <div
            v-if="$q.screen.xs"
            class="absolute-bottom text-subtitle1 text-center"
          >
            {{ name }}
          </div>
        </q-img>
        <q-badge v-if="type === 'ERC1155'" color="accent" floating>
          {{ amount }}
          <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
          <span v-if="pendingTransferAmount > 0">
            –{{ pendingTransferAmount }}
          </span>
        </q-badge>
        <q-card-section class="content">
          <div
            v-if="$q.screen.gt.xs"
            class="text-h6 q-mb-xs name"
            :title="name"
          >
            {{ name }}
          </div>
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
          v-if="!hideTransfer"
          flat
          :disabled="pendingTransferNoneLeft"
          @click="showTransferDialog"
        >
          {{ $t('transfer') }}</q-btn
        >
      </q-card-actions>
    </q-card>

    <q-dialog v-model="propertiesDialog">
      <q-card style="width: 45em; max-width: 80vw;">
        <q-toolbar>
          <q-toolbar-title>{{ $t('properties') }}</q-toolbar-title>

          <q-btn v-close-popup flat round dense icon="close" />
        </q-toolbar>

        <q-card-section>
          <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
          <div>ID: 0x{{ hexId }}</div>

          <div>
            <vue-json-pretty :data="properties"> </vue-json-pretty>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import TransferDialog from '../TransferDialog';

function handleDecentralizedProtocols(url) {
  const urlUrl = new URL(url);
  const { protocol } = urlUrl;

  const cleanProtocol = protocol.slice(0, -1);

  if (cleanProtocol === 'ipfs') {
    let cleanPathname = url.slice(7);
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
  components: { VueJsonPretty },
  props: {
    coinbase: {
      type: String,
      default: '0x0'
    },
    contract: {
      type: Object,
      default: () => {}
    },
    id: {
      type: String,
      default: '0'
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
    },
    hideTransfer: {
      type: Boolean,
      default: false
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
      imageLoaded: false,
      state: 'OK',
      pendingTransferNoneLeft: false,
      pendingTransferAmount: 0
    };
  },
  computed: {
    badCORSHosts() {
      return this.$store.state.badCors.hosts;
    }
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
          if (response.data.image) {
            this.image = handleDecentralizedProtocols(response.data.image);
          }
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
              this.properties =
                localeResponse.data.properties ||
                response.data.properties ||
                response.data.attributes;
            });
          } else {
            this.name = response.data.name;
            this.description = response.data.description;
            this.properties =
              response.data.properties || response.data.attributes;
          }
        })
        .catch(err => {
          if (typeof err.response === 'undefined') {
            if (!this.fixedCORS) {
              const url = new URL(this.uri);
              this.$store.dispatch('badCors/addHost', url.host);
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
      const { host, pathname } = urlUrl;

      if (this.badCORSHosts.includes(host)) {
        return `https://unft_wallet-corsflare.ktlxv.workers.dev/${pathname}?3gjkLKyhu6w4kwNQwKpJ=${host}`;
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
<style scoped lang="scss">
$token-img-size: 180px;

.q-card {
  height: 237px;
  width: 500px;
}

.q-img {
  width: $token-img-size;
  margin-top: 7px;
  margin-left: 7px;
}

body.screen--xs .q-card {
  height: 357px;
  width: 300px;
  .q-card__section {
    padding: 0;
  }
  .q-card__actions {
    position: absolute;
    bottom: 0;
    width: 100%;
  }
  .content {
    padding: 16px 16px 0;
  }
  .imageSkeleton {
    width: 100%;
  }
  .q-img {
    width: 100%;
    margin-top: 0px;
    margin-left: 0px;
  }
}

.tokenImage {
  max-height: $token-img-size;
  min-width: $token-img-size;
  .empty {
    height: $token-img-size;
    width: $token-img-size;
  }
}

.imageSkeleton {
  height: $token-img-size;
  width: $token-img-size;
}

.name {
  -webkit-line-clamp: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  .q-skeleton {
    width: 220px;
  }
}

.description {
  -webkit-line-clamp: 5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;

  .q-skeleton {
    &:nth-of-type(1) {
      width: 200px;
    }
    &:nth-of-type(2) {
      width: 230px;
    }
    &:nth-of-type(3) {
      width: 180px;
    }
  }
}
</style>
