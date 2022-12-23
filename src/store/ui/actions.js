export function saveLogin({ commit, dispatch }) {
  // eslint-disable-next-line no-underscore-dangle
  this._vm.$web3.instance.eth.getAccounts().then(
    addresses => {
      const [coinbase] = addresses;
      if (coinbase !== undefined) {
        commit('SET_COINBASE', coinbase);
        commit('SET_CONNECTED', true);
        // eslint-disable-next-line no-underscore-dangle
        this._vm.$web3.instance.eth.getChainId().then(chainId => {
          commit('SET_CHAIN_ID', chainId);
        });
      } else {
        dispatch('logout');
      }
    },
    () => {
      dispatch('logout');
    }
  );
}

export function logout({ commit }) {
  commit('SET_CHAIN_ID', null);
  commit('SET_COINBASE', null);
  commit('SET_CONNECTED', false);
  commit('SET_WANT_LOGOUT', true);
}
