<i18n lang="yaml">
en:
  uNFTWallet: uNFT Wallet
  tagline: View and manage all your NFTs in a single place
  anyToken: Add any ERC721 or ERC1155 token contract
  anyChain: Works on any EVM compatible Chain
  local: All you information is stored on your device
  privateAnalytics: Privacy respecting, public analytics
  ipfs: View IPFS and centralized NFTs
  multilanguage: Support for multi-language ERC1155

es:
  uNFTWallet: uNFT Wallet
  tagline: Visualiza y administra todos tus NFTs en un solo lugar
  anyToken: Visualiza cualquier contrato ERC721 o ERC1155
  anyChain: Funciona con cualquier cadena compatible con EVM
  local: Toda tu información se almacena en tu dispositivo
  privateAnalytics: Analítica pública y respetuosa de privacidad
  ipfs: Visualiza NFTs almacenados en IPFS y servidores centralizados
  multilanguage: Compatibilidad con ERC1155 multi-idioma
</i18n>
<template>
  <div>
    <div class="q-pa-md main-container">
      <div class="row header justify-center">
        <div class="col-md-5 center">
          <inline-svg class="logo" :src="require('./logo.svg')"></inline-svg>
        </div>
        <div class="col-md-7 center header-text">
          <h1 class="center">{{ $t('uNFTWallet') }}</h1>
          <div class="tagline">
            {{ $t('tagline') }}
          </div>
        </div>
      </div>
      <div class="row advantages justify-evenly">
        <div class="col-md-4 center advantage">
          <inline-svg
            class="icon"
            :src="require('./contract.svg')"
          ></inline-svg>
          <div class="advantage">{{ $t('anyToken') }}</div>
        </div>
        <div class="col-md-4 center advantage">
          <inline-svg class="icon" :src="require('./evm.svg')"></inline-svg>
          <div class="advantage">{{ $t('anyChain') }}</div>
        </div>
        <div class="col-md-4 center advantage">
          <inline-svg class="icon" :src="require('./local.svg')"></inline-svg>
          <div class="advantage">{{ $t('local') }}</div>
        </div>
        <div class="col-md-4 center advantage">
          <inline-svg
            class="icon"
            :src="require('./noTracking.svg')"
          ></inline-svg>
          <div class="advantage">
            {{ $t('privateAnalytics') }}
            <a href="//unftwallet.goatcounter.com/" target="_blank">
              <q-icon name="fas fa-external-link-alt" />
            </a>
          </div>
        </div>
        <div class="col-md-4 center advantage">
          <inline-svg class="icon" :src="require('./ipfs.svg')"></inline-svg>
          <div class="advantage">{{ $t('ipfs') }}</div>
        </div>
        <div class="col-md-4 center advantage">
          <inline-svg
            class="icon"
            :src="require('./multilanguage.svg')"
          ></inline-svg>
          <div class="advantage">{{ $t('multilanguage') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  padding-top: 7px;
}
.icon {
  stroke: var(--q-accent);
  fill: var(--q-accent);
  max-width: 200px;
  max-width: 100%;
  max-height: 200px;
}
.logo {
  stroke: white;
  /*/width: 400px;*/
  max-width: 100%;
  height: 180px;
  padding-top: 5px;
}

h1 {
  color: white !important;
  margin: 0.3em;
  margin-top: 0px;
}
.header {
  background-color: var(--q-primary);
  padding: 10px;
  color: white;
}
.header-text {
  padding: 10px;
}
.tagline {
  font-size: 2em;
}
.advantages {
  margin-top: 2em;
  font-size: 1.5em;
}

.advantage {
  margin-top: 1em;
}
</style>
