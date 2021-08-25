import { boot } from 'quasar/wrappers';

import InlineSvg from 'vue-inline-svg';

export default boot(({ app }) => {
  app.component('InlineSvg', InlineSvg);
});
