import KardiaClient from 'kardia-js-sdk';
const RPC_ENDPOINT = 'https://dev.kardiachain.io';
const APLUS_ADDRESS = "0x1f50AC469908B81bFA14A86849CE29529ee4054e";
export const kardiaClient = new KardiaClient({ endpoint: RPC_ENDPOINT });
export const aplusInstance = kardiaClient.krc20;
export const smcModule = kardiaClient.contract;
export const transactionModule = kardiaClient.transaction;
export const accountModule = kardiaClient.account;
const kaiChainModule = kardiaClient.kaiChain;

export async function getAPlusBalance(address: string) {
    await aplusInstance.getFromAddress(APLUS_ADDRESS);
    let balance = await aplusInstance.balanceOf(address);
    return balance;
}

export async function getNonce(address: string) {
    let nonce = await accountModule.getNonce(address);
    return nonce;
}

export async function getGasPrice()
{
    const oracleGasPrice = await kaiChainModule.getGasPrice();
    return oracleGasPrice;

}
