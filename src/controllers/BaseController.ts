import { Provider, web3 } from "@project-serum/anchor";
import { MintLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import express from "express";
import OuterNFT from "../ameta/OuterNFT";
import { connection, getProgram, getProvider } from "../ameta/SolAMeta";
import { createAssociatedTokenAccountInstruction, getAtaForMint, getMetadata, getAMeta, TOKEN_METADATA_PROGRAM_ID } from "../ameta/SolUtils";

export interface BaseInput {
    refNo: string,
    
}
export default abstract class BaseController {

    public router = express.Router();
    public abstract initializeRoutes: () => void;

}