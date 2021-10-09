<i18n lang="yaml">
en:
  details: 'Details'
  transfer: 'Transfer'

es:
  details: 'Detalles'
  transfer: 'Transferir'
</i18n>

<template>
  <div>
    <q-card v-if="description === '' && name === ''" class="token">
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
          fit="contain"
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
          <!-- prettier-ignore -->
          <div class="q-mb-xs description" :title="description">{{ description }}</div>
        </q-card-section>
      </q-card-section>
      <q-card-actions align="around">
        <q-btn flat @click="showDetailsDialog">{{ $t('details') }}</q-btn>
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
  </div>
</template>

<script>
import TransferDialog from '../TransferDialog';
import DetailsDialog from '../DetailsDialog';

export function handleDecentralizedProtocols(url) {
  const urlUrl = new URL(url);
  const { protocol } = urlUrl;

  const cleanProtocol = protocol.slice(0, -1);

  if (cleanProtocol === 'ipfs') {
    let cleanPathname = url.slice(7);
    if (cleanPathname.indexOf('ipfs') === 0) {
      cleanPathname = cleanPathname.slice(5);
    }
    return `https://cloudflare-ipfs.com/ipfs/${cleanPathname}`;
  }

  return url;
}

export function handleIdExpansion(url, hexId) {
  return url.replace('{id}', hexId);
}

export function handleLocaleExpansion(url, locale) {
  return url.replace('{locale}', locale);
}

export function handleBadCORS(url, badCORSHosts) {
  const urlUrl = new URL(url);
  const { host, pathname } = urlUrl;

  if (badCORSHosts.includes(host)) {
    return `https://unft_wallet-corsflare.ktlxv.workers.dev/${pathname}?3gjkLKyhu6w4kwNQwKpJ=${host}`;
  }

  return url;
}
export default {
  name: 'TokenCard',
  props: {
    coinbase: {
      type: String,
      default: '0x0',
    },
    contract: {
      type: Object,
      default: () => {},
    },
    id: {
      type: String,
      default: '0',
    },
    uri: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    hideTransfer: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['transfer'],
  data() {
    return {
      name: '',
      description: '',
      hexId: '',
      image: null,
      imageOriginal: null,
      properties: null,
      avalilableLocales: [],
      fixedImage: false,
      fixedCORS: false,
      fixedCORSImage: false,
      imageLoaded: false,
      state: 'OK',
      pendingTransferNoneLeft: false,
      pendingTransferAmount: 0,
      handledUri: null,
    };
  },
  computed: {
    badCORSHosts() {
      return this.$store.state.badCors.hosts;
    },
    chainId() {
      return this.$store.state.web3.chainId;
    },
  },
  watch: {
    '$i18n.locale': function (locale) {
      if (this.avalilableLocales.includes(locale)) {
        this.load();
      }
    },
  },
  created() {
    const bn = new this.$web3.instance.utils.BN(this.id);
    const hexId = bn.toString(16);
    this.hexId = hexId.padStart(64, '0');
    this.load();
  },
  methods: {
    load() {
      this.handledUri = handleBadCORS(
        handleIdExpansion(handleDecentralizedProtocols(this.uri), this.hexId),
        this.badCORSHosts
      );
      this.$axios
        .get(this.handledUri)
        .then((response) => {
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
              ),
              this.badCORSHosts
            );

            this.$axios.get(handledLocaleUri).then((localeResponse) => {
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
          if (response.data.image || response.data.image_url) {
            this.imageOriginal = response.data.image || response.data.image_url;
            this.image = handleDecentralizedProtocols(
              response.data.image || response.data.image_url
            );
          }
        })
        .catch((err) => {
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
      this.$$on('transferSent', this.transferSent);
      this.$q
        .dialog({
          component: TransferDialog,
          componentProps: {
            coinbase: this.coinbase,
            contract: this.contract,
            id: this.id,
            type: this.type,
            currentAmount: this.amount,
          },
        })
        .onOk(() => {
          this.$$on('transferConfirmed', this.transferConfirmed);
        });
    },
    showDetailsDialog() {
      this.$q.dialog({
        component: DetailsDialog,
        componentProps: {
          // eslint-disable-next-line no-underscore-dangle
          contract: this.contract._address,
          owner: this.coinbase,
          type: this.type,
          currentAmount: this.amount,
          name: this.name,
          description: this.description,
          hexId: `0x${this.hexId}`,
          image: this.image,
          imageOriginal: this.imageOriginal,
          properties: this.properties,
          chainId: this.chainId,
          metadataURI: this.handledUri,
          metadataURIOriginal: this.uri,
          amount: this.amount,
        },
      });
    },
    transferConfirmed(ev) {
      // eslint-disable-next-line no-underscore-dangle
      if (ev.contract === this.contract._address && ev.id === this.id) {
        this.pendingTransferAmount = 0;
        this.$emit('transfer');
        this.$$off('transferConfirmed');
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
    imageError() {
      if (!this.fixedImage) {
        this.$axios
          .get(this.image, { responseType: 'blob' })
          .then((response) => {
            const reader = new FileReader();
            reader.readAsDataURL(response.data);
            reader.onloadend = () => {
              const base64String = reader.result;
              this.image = base64String;
            };
          });
        this.fixedImage = true;
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
$token-img-size: 180px;
$token-img-margin: 7px;

.q-card {
  height: 237px;
  width: 500px;

  .content {
    padding: 16px 16px 0;
    max-width: calc(100% - #{$token-img-size} - #{$token-img-margin});
  }
}

.q-img {
  width: $token-img-size;
  margin-top: $token-img-margin;
  margin-left: $token-img-margin;
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
    max-width: none;
  }
  .imageSkeleton {
    width: 100%;
  }
  .q-img {
    width: 100%;
    margin-top: 0px;
    margin-left: 0px;
    text-align: center;
  }
}

.tokenImage {
  height: $token-img-size;
  width: $token-img-size;
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

.token .description {
  -webkit-line-clamp: 5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  white-space: break-spaces;

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
