<template>
  <div>
    <q-select
      v-model="locale"
      dense
      fill-input
      emit-value
      :options="languages"
      option-value="code"
      option-label="name"
    >
      <template v-slot:before>
        <q-icon name="fa fa-language" />
      </template>
    </q-select>
  </div>
</template>

<script>
export default {
  name: 'LanguageChanger',
  props: {
    languages: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      locale: null
    };
  },
  watch: {
    locale(val) {
      this.$i18n.locale = val.toLowerCase();
      localStorage.locale = this.$i18n.locale;
    }
  },
  mounted() {
    if (localStorage.locale) {
      this.$i18n.locale = localStorage.locale;
    } else {
      this.$i18n.locale = this.$q.lang.getLocale();
    }
    this.locale = this.$i18n.locale.toUpperCase().substr(0, 2);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
