import { ConfirmedTransaction, TokenBalance, TransactionResponse } from "@solana/web3.js";
import moment from "moment";
import { closeDb, collection } from "./mongo";
import { MktTransaction } from "../models/MktTransaction";
import { connection } from "../ameta/SolAMeta";
import { OwnerWallet, TokenMint } from "../ameta/OPConfig";

class TransactionController {
    getTransaction = async (sig: string): Promise<TransactionResponse> => {
        const transactionResponse: TransactionResponse = await connection.getTransaction(sig, { commitment: 'confirmed' });

        return transactionResponse;
    }

    isValidTransferTokenSig = async (sig: string, payerWallet: string, amountTransfer: number): Promise<boolean> => {

        let transactionInDB = await this.getOrCreateTransactionFromDB(sig);
        if (transactionInDB.isHandled == true) return false;

        let transactionResponse: TransactionResponse = JSON.parse(transactionInDB.transactionResponse);
        let postTokenBalances: TokenBalance[] = transactionResponse.meta.postTokenBalances;
        let preTokenBalances: TokenBalance[] = transactionResponse.meta.preTokenBalances;

        let payerInPost = postTokenBalances.find((value, index) => { return value.owner == payerWallet && value.mint == TokenMint });

        if (!payerInPost) return false;

        let ownerInPost = postTokenBalances.find((value, index) => { return value.owner == OwnerWallet && value.mint == TokenMint });

        if (!ownerInPost) return false;

        let payerInPre = preTokenBalances.find((value, index) => { return value.owner == payerWallet && value.mint == TokenMint });

        if (!payerInPre) return false;

        let amountPre = Number(payerInPre.uiTokenAmount.amount);
        let amountPost = Number(payerInPost.uiTokenAmount.amount);
        amountTransfer = amountTransfer * Math.pow(10, 9);
        console.log(amountPost, amountPre, amountTransfer);
        if ((amountPre - amountPost) != amountTransfer) return false;
        return true;
    }

    getOrCreateTransactionFromDB = async (sig: string): Promise<MktTransaction> => {
        let mkt_transaction = await collection('mkt_transaction');
        let transaction: MktTransaction = await mkt_transaction.findOne<MktTransaction>({
            txSignature: sig
        });
        console.log('transaction', transaction);
        if (transaction) {
            closeDb();
            return transaction;
        } else {
            let transactionResponse = await this.getTransaction(sig);
            let newTransaction: MktTransaction = {
                txSignature: sig,
                isHandled: false,
                created: moment().format('YYYYMMDDHHmmSS'),
                transactionResponse: JSON.stringify(transactionResponse),
            }
            await mkt_transaction.insertOne(newTransaction);
            closeDb();
            
            return newTransaction
        }
        
    }
}

export default new TransactionController();