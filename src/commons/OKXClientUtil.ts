import Web3 from "web3";

const OKC_RPC_ENDPOINT = 'https://exchaintestrpc.okex.org';
export const OKC_APLUS_CONTRACT_ADDRESS = "0xd551ac44cea8e06470ca3dd60b6eb1dbdf533925";
export const OKC_APLUS_OWNER = "0xa410158364ab27f91b093ccd9acb5e992b8bed40";
export const OKC_NFT_ADDRESS = "0xd308d9d3f6b51c26f061f5cf0fb66357c1f62641";

export const web3OKRC = new Web3(Web3.givenProvider || OKC_RPC_ENDPOINT);
export const OKCAPlusContract = new web3OKRC.eth.Contract(getAplusABI(), OKC_APLUS_CONTRACT_ADDRESS);
export const OKCNFTContract = new web3OKRC.eth.Contract(getNFTABI(), OKC_NFT_ADDRESS);


export async function getAPlusBalance(address: string) {
    let balance: number = await OKCAPlusContract.methods.balanceOf(address).call();
    return balance / 1e18;
}

export function getAplusABI() {
    const fs = require('fs');
    var jsonFile = __dirname + "/OKCAplusToken.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    return abi;
}
export function getNFTABI() {
    const fs = require('fs');
    var jsonFile = __dirname + "/OKCNFTItem.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    return abi;
}