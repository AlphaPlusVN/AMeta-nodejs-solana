import { ethers } from "ethers";
import { mintBoxBatchTrigger, mintBoxTrigger, openBoxEventTrigger } from "../service/ContractEventHandler";
import { PoolSellBox } from "./PoolSellBoxPublicABI";
export namespace KardiaUtils {
    export const KAR_APLUS_CONTRACT_ADDRESS = "0x9a79f1247D66F2119955cD322e62745095De6F2F";
    export const KAR_APLUS_OWNER = "0x7cb298F7511F1182f29e88FcCd2fF0509B58ef7a";
    const KAR_RPC_ENDPOINT = 'https://rpc.kardiachain.io';
    export const BOX_CONTRACT_ADDRESS = "0x00EAEAEc82BAF99B3aFdc60930a937696708f730"; //main
    const POOL_SELL_BOX_ADDRESS = "0xAB72D4d28178c9f1AE628160a047201ec6582B5F"; //main
    
    // const KAR_RPC_ENDPOINT = 'https://dev.kardiachain.io'; //test
    // export const BOX_CONTRACT_ADDRESS = "0xAB72D4d28178c9f1AE628160a047201ec6582B5F"; //test
    // const POOL_SELL_BOX_ADDRESS = "0x2c9FF4b226B36D1e180E728fb342D74f82D32b4E"; //test

    const NFT_ADDRESS = "0x2DDCB116Fb46eFe8855156300c027533fD32a556";

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

    export const NFTContract = new ethers.Contract(
        NFT_ADDRESS,
        getNFTABI(),
        provider
    );

    export async function boxEventListener() {
        console.log("listen event of KAR " + BOX_CONTRACT_ADDRESS);
        BoxContract.on("Mint", async (...params) => {
            console.log("Mint event")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [tokenId, boxType, to] = args;
            console.log("txHash " + transactionHash);
            await mintBoxTrigger(tokenId.toNumber(), to, boxType.toNumber(), BOX_CONTRACT_ADDRESS);
        });
        BoxContract.on("MintBatch", async (...params) => {
            console.log("Mint batch event")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [tokenIds, boxType, to] = args;
            console.log("txHash " + transactionHash);
            let listTokenId = new Array<number>();
            for (let tokenId of tokenIds) {
                listTokenId.push(tokenId.toNumber());
            }
            await mintBoxBatchTrigger(listTokenId, to, boxType.toNumber(), BOX_CONTRACT_ADDRESS);
        });
        BoxContract.on("OpenBox", async (...params) => {
            console.log("OpenBox event")
            const eventData = params[params.length - 1];
            const { transactionHash, blockNumber, args } = eventData;
            const [owner, tokenId, collectionId, boxType] = args;
            console.log("txHash " + transactionHash);
            console.log(JSON.stringify(args));
            await openBoxEventTrigger(owner, tokenId.toNumber(), collectionId.toNumber(), boxType.toNumber(), NFT_ADDRESS);
        });
    }

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
        let jsonFile = __dirname + "/NFTABI.json";
        let parsed = JSON.parse(fs.readFileSync(jsonFile));
        return parsed;
    }

    function getBoxABI() {
        const fs = require('fs');
        let jsonFile = __dirname + "/BoxABI.json";
        let parsed = JSON.parse(fs.readFileSync(jsonFile));
        return parsed;
    }
}