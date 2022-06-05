import { Document } from "mongodb"

export interface User extends Document{
    username: string,
    password: string,
    nonce: string,
    walletAddress: string,
    email?: string,
}