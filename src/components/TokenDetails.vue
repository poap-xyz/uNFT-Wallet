<i18n lang="yaml">
en:
  description: 'Description'
  share: 'Share'
  owner: 'Owner'
  properties: 'Properties'
  advanced: 'Advanced'
  copySuccess: 'Link copied to clipboard'
  copyFailed: 'Automatic copying failed, please copy and paste the following link'
  metadataURI: 'Metadata URI'
  imageUri: 'Image URI'
  amount: 'Amount'
  erc1155OwnerExplanation: 'ERC1155 Tokens can have multiple copies of the same ID, which can be owned by the same or different acounts'
  contract: 'Contract'
  contractWarning: 'It is easy to create fake versions of NFTs, please verify that this contract address is the one you expect'

es:
  description: 'Descripción'
  share: 'Compartir'
  owner: 'Dueño'
  properties: 'Propiedades'
  advanced: 'Avanzado'
  copySuccess: 'El vínculo ha sido copiado'
  copyFailed: 'Hubo un error al copiar el vínculo automáticamente, favor de copiar el siguiente link'
  metadataURI: 'URI Metadatos'
  imageUri: 'URI Imagen'
  amount: 'Cantidad'
  erc1155OwnerExplanation: 'Los Tokens ERC1155 pueden tener varias copias con el mismo ID, estas pueden perteneder a la misma o a diferentes cuentas'
  contract: 'Contrato'
  contractWarning: 'Es sencillo crear versiones falsas de NFTs, favor de verificar que esta dirección corresponde al contrato que esperas'
</i18n>

<template>
  <div>
    <q-card-section :horizontal="$q.screen.gt.sm">
      <q-img
        :src="image || require('./TokenCard/no-image.svg')"
        class="token-image"
        fit="contain"
        @click="zoomImage = true"
      />
      <q-card-section class="content">
        <h3>
          {{ name }}
        </h3>
        <chain-chip :chain-id="chainId" :chains="$web3.chains" />
        <q-chip outline>{{ type }}</q-chip>
        <div>
          {{ $t('contract') }}
          <q-icon name="warning" class="text-negative">
            <q-tooltip>{{ $t('contractWarning') }}</q-tooltip>
            <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
          </q-icon>
          :<address-chip :address="contractAddress" :chain-id="chainId" />
        </div>
        <div v-if="owner">
          {{ $t('owner') }}
          <q-icon v-if="type == 'ERC1155'" name="info">
            <q-tooltip>{{ $t('erc1155OwnerExplanation') }}</q-tooltip>
            <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
          </q-icon>
          : <address-chip :address="owner" :chain-id="chainId" />
        </div>
        <div v-if="type == 'ERC1155' && amount > 0">
          <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
          {{ $t('amount') }}: {{ amount }}
        </div>
        <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
        <div class="token-id">
          ID:
          <span v-if="idModeHex"> {{ hexId }} </span>
          <span v-if="!idModeHex"> {{ decId }} </span>
          <q-icon
            class="hex-switch"
            name="fas fa-exchange-alt"
            @click="idModeHex = !idModeHex"
          />
        </div>
        <!-- prettier-ignore -->
        <div v-if="description" class="q-mb-xs description"><h6>{{ $t('description') }}</h6>{{ description }}</div>
        <div v-if="parsedProperties.length">
          <h6>{{ $t('properties') }}</h6>
          <div class="row items-start q-gutter-md">
            <q-card
              v-for="prop in parsedProperties"
              :key="prop.key"
              class="property"
            >
              <q-card-section>
                <q-item-label overline>{{ prop.key }}</q-item-label>
                <q-item-label>{{ prop.value }}</q-item-label>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <h6>{{ $t('advanced') }}</h6>
        <q-list bordered class="rounded-borders advanced">
          <q-expansion-item
            expand-separator
            icon="perm_identity"
            :label="$t('properties')"
          >
            <q-card>
              <q-card-section>
                <vue-json-pretty :data="properties"> </vue-json-pretty>
              </q-card-section>
            </q-card>
          </q-expansion-item>
          <q-expansion-item
            expand-separator
            icon="language"
            :label="$t('metadataURI')"
          >
            <q-card>
              <q-card-section>
                <a :href="metadataUri" target="_blank">
                  <q-icon name="fas fa-external-link-alt" />
                </a>
                {{ metadataUriOriginal }}
              </q-card-section>
            </q-card>
          </q-expansion-item>
          <q-expansion-item
            expand-separator
            icon="wallpaper"
            :label="$t('imageUri')"
          >
            <q-card>
              <q-card-section>
                <a :href="image" target="_blank">
                  <q-icon name="fas fa-external-link-alt" />
                </a>
                {{ imageOriginal }}
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-card-section>
    </q-card-section>
    <q-card-actions align="around">
      <q-btn @click="share">{{ $t('share') }}</q-btn>
    </q-card-actions>
    <q-dialog v-model="zoomImage" full-height full-width>
      <q-img
        v-close-popup
        class="zoomed-image"
        :src="image || require('./TokenCard/no-image.svg')"
        fit="contain"
      />
    </q-dialog>
    <q-dialog v-model="shareModal">
      <q-card class="share-modal">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('share') }}</div>
          <q-space />
          <q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>
        <q-item>
          <q-item-section>
            {{ $t('copyFailed') }}
            <input v-model="shareLink" />
          </q-item-section>
        </q-item>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { copyToClipboard } from 'quasar';
import Web3 from 'web3';

import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

import ChainChip from '../components/ChainChip';
import AddressChip from '../components/AddressChip';

function makeLink(chainId, contract, tokenId, type, owner) {
  const host = window.location.origin;
  const query = type === 'ERC1155' && owner ? `?owner=${owner}` : '';
  return `${host}/#/single/${chainId}/${contract}/${tokenId}${query}`;
}

function parseBool(value) {
  if (value === true) {
    return 'Yes';
  }
  if (value === false) {
    return 'No';
  }
  return value;
}

function parseKey(key) {
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function parseProperties(props) {
  if (props) {
    if (props && props.constructor === Array) {
      const [first] = props;
      const keys = Object.keys(first);
      const valueIndex = keys.indexOf('value');
      if (valueIndex > -1) {
        const keyVar = keys[(valueIndex + 1) % 1];
        return props.map((prop) => {
          return {
            key: parseKey(prop[keyVar]),
            value: parseBool(prop.value),
          };
        });
      }
      return [];
    }
    const propsArray = Object.entries(props).map((prop) => {
      return {
        key: parseKey(prop[0]),
        value: parseBool(prop[1]),
      };
    });
    return propsArray;
  }
  return [];
}

export default {
  name: 'TokenDetails',
  components: { AddressChip, ChainChip, VueJsonPretty },
  props: {
    contractAddress: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      default: null,
    },
    metadataUri: {
      type: String,
      required: true,
    },
    metadataUriOriginal: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    currentAmount: {
      type: Number,
      default: 0,
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
    chainId: {
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
      shareModal: false,
      shareLink: null,
      zoomImage: false,
      idModeHex: false,
    };
  },
  computed: {
    parsedProperties() {
      return parseProperties(this.properties);
    },
    decId() {
      return new Web3.utils.BN(this.hexId.substring(2), 16).toString(10);
    },
  },
  created() {},
  methods: {
    share() {
      const link = makeLink(
        this.chainId,
        this.contractAddress,
        this.hexId,
        this.type,
        this.owner
      );
      copyToClipboard(link)
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: this.$t('copySuccess'),
          });
        })
        .catch(() => {
          this.shareLink = link;
          this.shareModal = true;
        });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
$detail-img-size: 400px;

body.screen--sm,
body.screen--xs {
  .token-image {
    height: initial;
    margin: 0;
    width: 100%;

    img {
      max-width: 100%;
    }
  }
}

.token-image {
  width: $detail-img-size;
  height: $detail-img-size;
  max-width: 100%;
  max-height: $detail-img-size;
  margin: 20px;
  cursor: zoom-in;
}

.token-id {
  word-break: break-all;
}

.description {
  white-space: break-spaces;
}

.zoomed-image {
  overflow: hidden;
}

.content {
  flex-grow: 1;
}

.share-modal {
  max-width: 300px;
}

.property {
  align-self: stretch;
}

.hex-switch {
  cursor: pointer;
  margin-left: 0.5em;
}

.advanced .q-expansion-item .q-expansion-item__content .q-card__section {
  overflow-x: auto;
}

.q-dark .q-item__label--overline {
  color: #fff;
}

h3,
h6 {
  margin-top: 0;
  margin-bottom: 0.3em;
}
</style>
