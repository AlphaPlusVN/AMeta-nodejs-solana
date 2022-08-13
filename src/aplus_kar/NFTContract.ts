import { BoxConfig } from '../entities/BoxConfig';
import { WalletCache } from '../entities/WalletCache';
import { DI } from '../configdb/database.config';
import { getAPlusBalance, APLUS_OWNER, NFTContract, web3, DEFAULT_NFT_SMC_ADDRESS } from '../commons/KardiaUtils';
import { transferAPlusToken } from './AplusContract';
import { NFTMetaData } from '../ameta/NFTMetadata';

export const mintBoxKar = async (walletAddress: string, box: BoxConfig, price: number) => {
    let boxTokenId: number = 0;
    const walletCacheRepo = DI.em.fork().getRepository(WalletCache);
    try {
        console.log("Check balance " + walletAddress);
        let balance = await getAPlusBalance(walletAddress);
        console.log("Aplus balance " + balance);
        if (balance < price) {
            throw "Aplus not enough";
        }
        let walletSender = await walletCacheRepo.findOne({ walletAddress });
        //tranfer token to owner
        let result = await transferAPlusToken(walletSender, APLUS_OWNER, price);
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
                'to': DEFAULT_NFT_SMC_ADDRESS,
                'data': mintNFT
            };
            let tx = await web3.eth.accounts.signTransaction(rawTransaction, walletSender.secretKey);
            let txResult = await web3.eth.sendSignedTransaction(tx.rawTransaction).on('receipt', console.log);
            console.log("Mint NFT result " + txResult.status);
            boxTokenId = mintNFT;
        }   
        return boxTokenId;
    } catch (e) {
        console.log(e);
        return -1;
    }
}