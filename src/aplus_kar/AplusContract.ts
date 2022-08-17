import { APlusContract, APLUS_CONTRACT_ADDRESS, APLUS_OWNER, web3 } from '../commons/KardiaUtils';
import { DI } from '../configdb/database.config';
import { WalletCache } from '../entities/WalletCache';


export async function mintAplus(to: string, amount: number, isWei: boolean) {
    let result;
    if (isWei) {
        console.log("Mint " + amount * Math.pow(10, -18) + " Aplus to " + to);
        result = await APlusContract.methods.mint(to, amount).send();
    } else {
        console.log("Mint " + amount + " Aplus to " + to);
        result = await APlusContract.methods.mint(to, web3.utils.toWei(amount + "", "ether")).send();
    }
    console.log("Mint aplus resp " + result);
}

export async function systemTransferAplus(userWallet: string, amount: number) {
    const walletRepo = DI.em.fork().getRepository(WalletCache);
    let walletSender = await walletRepo.findOne({ walletAddress: userWallet });
    let result = await transferAPlusToken(walletSender, APLUS_OWNER, amount);
    return result.status;
}

export async function transferAPlusToken(walletSender: WalletCache, receiverAddress: string, amount: number) {
    const data = await APlusContract.methods.transfer(receiverAddress, web3.utils.toWei(amount + "")).encodeABI();
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 90000;
    const rawTransaction = {
        'from': walletSender.walletAddress,
        'gasPrice': web3.utils.toHex(gasPrice),
        'gasLimit': web3.utils.toHex(gasLimit),
        'to': APLUS_CONTRACT_ADDRESS,
        'data': data
    };
    let tx = await web3.eth.accounts.signTransaction(rawTransaction, walletSender.secretKey);
    let txResult = await web3.eth.sendSignedTransaction(tx.rawTransaction).on('receipt', console.log);
    return txResult;
}