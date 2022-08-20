import { BoxConfig } from '../entities/BoxConfig';
import { WalletCache } from '../entities/WalletCache';
import { DI } from '../configdb/database.config';
import { getAPlusBalance, KAR_APLUS_OWNER, NFTContract, web3, KAR_NFT_ADDRESS } from '../commons/KardiaUtils';
import { transferAPlusTokenKar } from './AplusContractKar';
import { NFTMetaData } from '../ameta/NFTMetadata';
import { Item } from '../entities/ItemEntity';

export const mintBoxKar = async (walletAddress: string, box: BoxConfig, price: number) => {
    const walletCacheRepo = DI.em.fork().getRepository(WalletCache);
    try {
        let balance = await getAPlusBalance(walletAddress);
        console.log("Aplus balance " + balance);
        if (balance < price) {
            throw "Aplus not enough";
        }
        let walletSender = await walletCacheRepo.findOne({ walletAddress });
        //tranfer token to owner
        let result = await transferAPlusTokenKar(walletSender, KAR_APLUS_OWNER, price);
        console.log("Transfer Aplus result " + result.status);
        //check success
        if (result) {
            let cid = await NFTMetaData.uploadBoxMetadata(box.code, walletAddress);
            let mintNFT = await NFTContract.methods.awardItem(walletAddress, cid).encodeABI();
            const gasPrice = await web3.eth.getGasPrice();
            const gasLimit = 900000;
            const rawTransaction = {
                'from': walletSender.walletAddress,
                'gasPrice': web3.utils.toHex(gasPrice),
                'gas': web3.utils.toHex(gasPrice),
                'gasLimit': web3.utils.toHex(gasLimit),
                'to': KAR_NFT_ADDRESS,
                'data': mintNFT
            };
            let tx = await web3.eth.accounts.signTransaction(rawTransaction, walletSender.secretKey);
            let txResult = await web3.eth.sendSignedTransaction(tx.rawTransaction).on('receipt', console.log);
            console.log("Mint NFT result " + txResult.status);
            return txResult.status;
        }
        return false;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export const mintKarNFTItem = async (walletAddress: string, item: Item) => {
    const walletCacheRepo = DI.em.fork().getRepository(WalletCache);
    try {
        let walletSender = await walletCacheRepo.findOne({ walletAddress: walletAddress });
        //ameta token acc
        let cid = await NFTMetaData.uploadItemMetadata(item, walletAddress);
        let mintNFT = await NFTContract.methods.awardItem(walletAddress, cid).encodeABI();
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 900000;
        const rawTransaction = {
            'from': walletSender.walletAddress,
            'gasPrice': web3.utils.toHex(gasPrice),
            'gas': web3.utils.toHex(gasPrice),
            'gasLimit': web3.utils.toHex(gasLimit),
            'to': KAR_NFT_ADDRESS,
            'data': mintNFT
        };
        let tx = await web3.eth.accounts.signTransaction(rawTransaction, walletSender.secretKey);
        let txResult = await web3.eth.sendSignedTransaction(tx.rawTransaction).on('receipt', console.log);
        console.log("Mint NFT result " + txResult.status);
        return txResult.status;
    } catch (e) {
        console.log(e);
        return false;
    }
}