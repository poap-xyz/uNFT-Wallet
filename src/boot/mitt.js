import { boot } from 'quasar/wrappers';
import mitt from 'mitt';

export default boot(({ app }) => {
  const pagebus = mitt();
  // eslint-disable-next-line no-param-reassign
  app.config.globalProperties.$$on = pagebus.on;
  // eslint-disable-next-line no-param-reassign
  app.config.globalProperties.$$emit = pagebus.emit;
  // eslint-disable-next-line no-param-reassign
  app.config.globalProperties.$$off = pagebus.off;
});
