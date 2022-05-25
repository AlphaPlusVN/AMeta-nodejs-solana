import { Provider, web3 } from "@project-serum/anchor";
import { MintLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import express from "express";
import OuterNFT from "../ameta/OuterNFT";
import { connection, createNFTInstructionArray, getProgram, getProvider } from "../ameta/SolAMeta";
import { createAssociatedTokenAccountInstruction, getAtaForMint, getMetadata, getAMeta, TOKEN_METADATA_PROGRAM_ID } from "../ameta/SolUtils";

export interface BaseInput {
    refNo: string,
    
}
export default abstract class BaseController {

    public router = express.Router();
    public abstract initializeRoutes: () => void;

    createNft = async (payer: web3.PublicKey, name: string, symbol: string, uri: string) => {
        let mint = Keypair.generate();
        const [outerSpacePDA, bump] = await getAMeta();
        const metadataAddress = await getMetadata(mint.publicKey);
        const userTokenAccountAddress = (
            await getAtaForMint(mint.publicKey, payer)
        )[0];
        const program = await getProgram();
        let create_nft_tx = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: payer,
                newAccountPubkey: mint.publicKey,
                space: MintLayout.span,
                lamports: await Token.getMinBalanceRentForExemptMint(connection),
                programId: TOKEN_PROGRAM_ID
            }),
            // init mint account
            Token.createInitMintInstruction(
                TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
                mint.publicKey, // mint pubkey
                0, // decimals
                payer, // mint authority
                payer // freeze authority (if you don't need it, you can set `null`)
            ),
            createAssociatedTokenAccountInstruction(
                userTokenAccountAddress,
                payer,
                payer,
                mint.publicKey,
            ),
            Token.createMintToInstruction(
                TOKEN_PROGRAM_ID,
                mint.publicKey,
                userTokenAccountAddress,
                payer,
                [],
                1,
            ),
            await program.instruction.mintNftBox(bump, name, symbol, uri, {
                accounts: {
                    outerSpace: outerSpacePDA,
                    payer: payer,
                    mint: mint.publicKey,
                    metadata: metadataAddress,
                    mintAuthority: payer,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    rent: web3.SYSVAR_RENT_PUBKEY,

                    wallet: program.provider.wallet.publicKey
                }
            })
        )
        let provider: Provider = await getProvider();
        return await provider.send(create_nft_tx, [mint]);
    }

   

}