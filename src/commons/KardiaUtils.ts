import Web3 from 'web3';

const KAR_RPC_ENDPOINT = 'https://dev.kardiachain.io';
export const KAR_APLUS_CONTRACT_ADDRESS = "0x9a79f1247D66F2119955cD322e62745095De6F2F";
export const KAR_APLUS_OWNER = "0x7cb298F7511F1182f29e88FcCd2fF0509B58ef7a";
export const KAR_NFT_ADDRESS = "0x4eED16A58601334D1B71650A1c6738083D98567b";

export const web3 = new Web3(Web3.givenProvider || KAR_RPC_ENDPOINT);
export const APlusContract = new web3.eth.Contract(getAplusABI(), KAR_APLUS_CONTRACT_ADDRESS);
export const NFTContract = new web3.eth.Contract(getNFTABI(), KAR_NFT_ADDRESS);


export async function getAPlusBalance(address: string) {
    let balance: number = await APlusContract.methods.balanceOf(address).call();
    return balance / 1e18;
}

export function getAplusABI() {
    const fs = require('fs');
    var jsonFile = __dirname + "/AplusToken.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    return abi;
}
export function getNFTABI() {
    const fs = require('fs');
    var jsonFile = __dirname + "/NFTItem.json";
    var parsed = JSON.parse(fs.readFileSync(jsonFile));
    var abi = parsed.abi;
    return abi;
}