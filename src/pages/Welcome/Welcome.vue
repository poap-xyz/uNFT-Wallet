<i18n lang="yaml">
en:
  uNFTWallet: uNFT Wallet
  tagline: View and manage all your NFTs in a single place
  anyToken: Add any ERC721 or ERC1155 token contract
  anyChain: Works on any EVM comparible Chain
  local: All you information is stored on your device
  noTracking: No tracking
  ipfs: View IPFS and centralized NFTs
  multilanguage: Support for multi-language ERC1155

es:
  uNFTWallet: uNFT Wallet
  tagline: Visualiza y administra todos tus NFTs en un solo lugar
  anyToken: Add any ERC721 or ERC1155 token contract
  anyChain: Works on any EVM comparible Chain
  local: All you information is stored on your device
  noTracking: No tracking
  ipfs: View IPFS and centralized NFTs
  multilanguage: Support for multi-language ERC1155

</i18n>
<template>
  <div>
    <div class="q-pa-md">
      <div class="row header">
        <div class="col-md-4 center">
          <inline-svg class="logo " :src="require('./logo.svg')"></inline-svg>
        </div>
        <div class="col center">
          <h1 class="center text-accent">{{ $t('uNFTWallet') }}</h1>
          <div class="tagline">
            {{ $t('tagline') }}
          </div>
        </div>
      </div>
      <div class="row advantages">
        <div class="col center">
          <inline-svg
            class="icon"
            :src="require('./contract.svg')"
          ></inline-svg>
          <div class="advantage">{{ $t('anyToken') }}</div>
        </div>
        <div class="col center">
          <inline-svg class="icon" :src="require('./evm.svg')"></inline-svg>
          <div class="advantage">{{ $t('anyChain') }}</div>
        </div>
        <div class="col center">
          <inline-svg class="icon" :src="require('./local.svg')"></inline-svg>
          <div class="advantage">{{ $t('local') }}</div>
        </div>
      </div>
      <div class="row advantages">
        <div class="col center">
          <inline-svg
            class="icon"
            :src="require('./noTracking.svg')"
          ></inline-svg>
          <div class="advantage">{{ $t('noTracking') }}</div>
        </div>
        <div class="col center">
          <inline-svg class="icon" :src="require('./ipfs.svg')"></inline-svg>
          <div class="advantage">{{ $t('ipfs') }}</div>
        </div>
        <div class="col center">
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

<style>
.icon {
  stroke: var(--q-color-accent);
  fill: var(--q-color-accent);
  max-width: 200px;
  max-height: 200px;
}
.logo {
  stroke: white;
  width: 400px;
  height: 200px;
}
h1.text-accent {
  color: white !important;
  margin: 0.3em;
}
.header {
  background-color: var(--q-color-primary);
  padding: 10px;
  color: white;
}
.tagline {
  font-size: 2em;
}
.advantages {
  margin: 2em;
  font-size: 1.5em;
}
</style>
