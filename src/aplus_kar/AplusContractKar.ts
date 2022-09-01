import { APlusContract, KAR_APLUS_CONTRACT_ADDRESS, KAR_APLUS_OWNER, web3Kar } from '../commons/KardiaUtils';
import { DI } from '../configdb/database.config';
import { WalletCache } from '../entities/WalletCache';


export async function mintAplusKar(to: string, amount: number, isWei: boolean) {
    let result;
    if (isWei) {
        console.log("Mint " + amount * Math.pow(10, -18) + " Aplus to " + to);
        result = await APlusContract.methods.mint(to, amount).send();
    } else {
        console.log("Mint " + amount + " Aplus to " + to);
        result = await APlusContract.methods.mint(to, web3Kar.utils.toWei(amount + "", "ether")).send();
    }
    console.log("Mint aplus resp " + result);
}

export async function systemTransferAplusKar(userWallet: string, amount: number) {
    const walletRepo = DI.em.fork().getRepository(WalletCache);
    let walletSender = await walletRepo.findOne({ walletAddress: userWallet });
    let result = await transferAPlusTokenKar(walletSender, KAR_APLUS_OWNER, amount);
    return result.status;
}

export async function transferAPlusTokenKar(walletSender: WalletCache, receiverAddress: string, amount: number) {
    const data = await APlusContract.methods.transfer(receiverAddress, web3Kar.utils.toWei(amount + "")).encodeABI();
    const gasPrice = await web3Kar.eth.getGasPrice();
    const gasLimit = 90000;
    const rawTransaction = {
        'from': walletSender.walletAddress,
        'gasPrice': web3Kar.utils.toHex(gasPrice),
        'gasLimit': web3Kar.utils.toHex(gasLimit),
        'to': KAR_APLUS_CONTRACT_ADDRESS,
        'data': data
    };
    let tx = await web3Kar.eth.accounts.signTransaction(rawTransaction, walletSender.secretKey);
    let txResult = await web3Kar.eth.sendSignedTransaction(tx.rawTransaction).on('receipt', console.log);
    return txResult;
}