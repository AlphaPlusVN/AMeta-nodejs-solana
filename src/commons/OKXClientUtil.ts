import Web3 from "web3";

const OKC_RPC_ENDPOINT = 'https://exchaintestrpc.okex.org';
export const OKC_APLUS_CONTRACT_ADDRESS = "0x9a79f1247D66F2119955cD322e62745095De6F2F";
export const OKC_APLUS_OWNER = "0x7cb298F7511F1182f29e88FcCd2fF0509B58ef7a";
export const OKC_NFT_ADDRESS = "0x4eED16A58601334D1B71650A1c6738083D98567b";

export const web3OKRC = new Web3(Web3.givenProvider || OKC_RPC_ENDPOINT);