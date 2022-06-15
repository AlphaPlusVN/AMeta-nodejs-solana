import { ConfirmedTransaction, TokenBalance, TransactionResponse } from "@solana/web3.js";
import moment, { min } from "moment";
import { connection } from "../ameta/SolAMeta";
import { OwnerWallet, TokenDecimals, TokenMint } from "../ameta/OPConfig";
import { ErrorCode } from "../config/ErrorCodeConfig";
import { MktTransaction } from "../entities/MktTransaction";
import { DI } from '../configdb/database.config';

class TransactionController {
    getTransaction = async (sig: string): Promise<TransactionResponse> => {
        try {
            const transactionResponse: TransactionResponse = await connection.getTransaction(sig, { commitment: 'confirmed' });
            return transactionResponse;
        } catch (err) {
            throw new Error(ErrorCode.TransferSigIsInvalid);
        }
        return null
    }

    validateTransferTokenSig = async (sig: string, payerWallet: string, amountTransfer: number, mint: string, decimals = TokenDecimals) => {
        try {
            let transactionInDB = await this.getOrCreateTransactionFromDB(sig);
            if (transactionInDB.isHandled == true) throw new Error(ErrorCode.TransferSigIsInvalid);

            let transactionResponse: TransactionResponse = JSON.parse(transactionInDB.transactionResponse);
            let postTokenBalances: TokenBalance[] = transactionResponse.meta.postTokenBalances;
            let preTokenBalances: TokenBalance[] = transactionResponse.meta.preTokenBalances;

            let payerInPost = postTokenBalances.find((value, index) => { return value.owner == payerWallet && value.mint == mint });

            if (!payerInPost) throw new Error(ErrorCode.TransferSigIsInvalid);

            let ownerInPost = postTokenBalances.find((value, index) => { return value.owner == OwnerWallet && value.mint == mint });

            if (!ownerInPost) throw new Error(ErrorCode.TransferSigIsInvalid);

            let payerInPre = preTokenBalances.find((value, index) => { return value.owner == payerWallet && value.mint == mint });

            if (!payerInPre) throw new Error(ErrorCode.TransferSigIsInvalid);


            let amountPre = Number(payerInPre.uiTokenAmount.amount);
            let amountPost = Number(payerInPost.uiTokenAmount.amount);

            amountTransfer = amountTransfer * Math.pow(10, decimals);
            console.log(amountPost, amountPre, amountTransfer);
            if ((amountPre - amountPost) != amountTransfer) throw new Error(ErrorCode.TransferSigIsInvalid);

        } catch (err) {
            throw new Error(ErrorCode.TransferSigIsInvalid);
        }
    }

    getOrCreateTransactionFromDB = async (sig: string): Promise<MktTransaction> => {
        const mktTransactionRepo = DI.em.fork().getRepository(MktTransaction);
        let transaction: MktTransaction = await mktTransactionRepo.findOne({
            txSignature: sig
        });
        console.log('transaction', transaction);
        if (transaction) {
            return transaction;
        } else {
            let transactionResponse = await this.getTransaction(sig);
            let newTransaction: MktTransaction = mktTransactionRepo.create({
                txSignature: sig,
                isHandled: false,
                created: moment().format('YYYYMMDDHHmmSS'),
                transactionResponse: JSON.stringify(transactionResponse),
            })
            await mktTransactionRepo.persistAndFlush(newTransaction);
            return newTransaction
        }

    }
    markDoneTransferSig = async (sig: string) => {
        const mktTransactionRepo = DI.em.fork().getRepository(MktTransaction);
        let transaction: MktTransaction = await mktTransactionRepo.findOne({
            txSignature: sig
        });
        transaction.isHandled = true;
        await mktTransactionRepo.persistAndFlush(transaction);
    }
}

export default new TransactionController();