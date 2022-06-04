import express, { Express, Request, Response } from 'express';

import App from './app';
import BoxController from './controllers/BoxController';

import AuthController from './controllers/AuthController';
import { getProgram, initAMeta } from './ameta/SolAMeta';
import { AMetaData, findAssociatedTokenAddress, getAMeta, MY_WALLET, validateBoxAddress } from './ameta/SolUtils';
import { BN, web3 } from '@project-serum/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const appExpress: Express = express();
// const port = process.env.PORT;
const app = new App(
    [
        new AuthController(),
        new BoxController(),
        // new BoxForSaleController(),
    ],
    appExpress
)

// initOuterSpace();

let test = async () => {
    
    // let outerSpaceData: AMetaData = {
    //     price: new BN(1),
    //     symbol: 'AMCCCC',
    //   };
      
    //   const program  = await getProgram();
    //   const [aMetaPDA, bump] = await getAMeta();
    //   const aMetaToken = new PublicKey('9ezfMjPwsPfRtRi41PER8xFpZDQCm2ccTj488uqGguT6');
    //   let ownerTokenAccount = await findAssociatedTokenAddress(MY_WALLET.publicKey, aMetaToken);
      
    //   let sig = await program.rpc.initializeGame(outerSpaceData, {
    //     accounts: {
    //       aMeta: aMetaPDA,
    //       aMetaMint: aMetaToken,
    //       tokenAccount: ownerTokenAccount,
    //       tokenProgram: TOKEN_PROGRAM_ID,
    //       rent: web3.SYSVAR_RENT_PUBKEY,
    //       authority: MY_WALLET.publicKey,
    //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //       systemProgram: SystemProgram.programId,
    //     },
    //     signers: [MY_WALLET],
  
    //   })
  
    //   console.log("aMetaPDA ==========", await program.account.aMeta.fetch(aMetaPDA));
  
      
}

test();


app.listen();