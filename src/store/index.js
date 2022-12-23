import { createStore } from 'vuex';
import web3 from './web3';
import ui from './ui';
import badCors from './badCors';

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function init(/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      web3,
      ui,
      badCors,
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV,
  });

  return Store;
}
