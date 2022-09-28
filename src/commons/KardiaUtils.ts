import { ethers } from "ethers";
import { PoolSellBox } from "./PoolSellBoxPublicABI";
export namespace KardiaUtils {
    const KAR_RPC_ENDPOINT = 'https://rpc.kardiachain.io';
    export const KAR_APLUS_CONTRACT_ADDRESS = "0x9a79f1247D66F2119955cD322e62745095De6F2F";
    export const KAR_APLUS_OWNER = "0x7cb298F7511F1182f29e88FcCd2fF0509B58ef7a";
    export const BOX_CONTRACT_ADDRESS = ""
    const POOL_SELL_BOX_ADDRESS = "0xAB72D4d28178c9f1AE628160a047201ec6582B5F"; //main

    const provider = new ethers.providers.JsonRpcProvider(KAR_RPC_ENDPOINT);

    export const BoxContract = new ethers.Contract(
        BOX_CONTRACT_ADDRESS,
        getBoxABI(), // abi
        provider
    );

    export const APlusContract = new ethers.Contract(
        KAR_APLUS_CONTRACT_ADDRESS,
        getBoxABI(), // abi
        provider
    );

    export const PoolSellBoxContract = new ethers.Contract(
        POOL_SELL_BOX_ADDRESS,
        PoolSellBox._abi, // abi
        provider
    );

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

    function getBoxABI() {
        const fs = require('fs');
        let jsonFile = __dirname + "/BoxABI.json";
        let parsed = JSON.parse(fs.readFileSync(jsonFile));
        return parsed;
    }
}