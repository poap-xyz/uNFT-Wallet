import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'en-us',
  fallbackLocale: 'en-us'
});

export default ({ app }) => {
  // Set i18n instance on app
  // eslint-disable-next-line no-param-reassign
  app.i18n = i18n;
};

export { i18n };
