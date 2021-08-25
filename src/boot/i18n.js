import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  locale: 'en',
});

export default ({ app }) => {
  // Set i18n instance on app
  app.use(i18n);
};

export { i18n };
