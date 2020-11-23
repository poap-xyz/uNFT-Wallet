<i18n lang="yaml">
en:
  message: "Oops. Nothing here..."

es:
  message: "Ups. No hay nada aquí..."

</i18n>
<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
      <div style="font-size: 30vh">
        404
      </div>

      <div class="text-h2" style="opacity:.4">{{ $t('message') }}</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error404'
};
</script>
