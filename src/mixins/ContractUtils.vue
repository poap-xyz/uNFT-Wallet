<script>
import ABI1155 from '../artifacts/ierc1155.abi.json';
import ABI721 from '../artifacts/ierc721metadata.abi.json';

function getABI(type) {
  if (type === 'ERC721') {
    return ABI721;
  }
  return ABI1155;
}
export async function getContractType(web3, address) {
  const contractTypeCheck = new web3.eth.Contract(ABI1155, address);
  let type = null;
  await contractTypeCheck.methods
    .supportsInterface('0xd9b67a26') // ERC1155 Standard
    .call()
    .then(async (isERC1155) => {
      if (isERC1155) {
        type = 'ERC1155';
      }
      await contractTypeCheck.methods
        .supportsInterface('0x80ac58cd') // ERC721 Standard
        .call()
        .then((isERC721) => {
          if (isERC721) {
            type = 'ERC721';
          }
        });
    });
  return type;
}

export const ContractUtils = {
  data() {
    return {};
  },
  created() {},
  methods: {
    getContract: (web3, type, address) => {
      return new web3.eth.Contract(getABI(type), address);
    },
  },
};

export default ContractUtils;
</script>
