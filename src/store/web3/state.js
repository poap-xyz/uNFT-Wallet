export default function state() {
  return {
    isInjected: false,
    provider: null,
    chainId: null,
    coinbase: '',
    balance: null,
    connected: false,
    error: null,
    wantToChangeAccount: false,
    wantToLogout: false,
  };
}
