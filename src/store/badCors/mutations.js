// eslint-disable-next-line import/prefer-default-export
export function ADD_HOST(state, host) {
  if (!state.hosts.includes(host)) {
    state.hosts.push(host);
  }
}
