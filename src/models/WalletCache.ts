import { Document } from 'mongodb';
export interface WalletCache extends Document
{
    walletAddress: string,
    secretKey: string,
}