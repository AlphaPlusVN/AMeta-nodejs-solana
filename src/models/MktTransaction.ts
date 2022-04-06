import { TransactionResponse } from "@solana/web3.js"
import { Document } from "mongodb"
export interface MktTransaction extends Document{
    txSignature: String,
    transactionResponse: string,
    isHandled: boolean,
    created: String,    
}