import express, { Express, Request, Response } from 'express';

import App from './app';
import BoxController from './controllers/BoxController';

import AuthController from './controllers/AuthController';
import { buyBox, connection, getProgram, initAMeta } from './ameta/SolAMeta';
import { AMetaData, findAssociatedTokenAddress, getAMeta, getMetadata, getMetadataNFT, MY_WALLET, TOKEN_METADATA_PROGRAM_ID, validateBoxAddress } from './ameta/SolUtils';
import { BN, web3 } from '@project-serum/anchor';
import { Keypair, PublicKey, SystemProgram, TransactionResponse } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { User } from './models/User';
import { closeDb, collection } from './commons/mongo';

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
    // await buyBox()
    // const transactionResponse: TransactionResponse = await connection.getTransaction('66e3GisHS2g1zkb1wvVjLXTAYdZm3piFv4AXN7HbuPHdQihfBixLjqi9zE7aN8F6WAw5YY8GDd7yF3ewdgpvQHpS', { commitment: 'confirmed' });
    // console.log(transactionResponse.meta.preTokenBalances);
    // console.log(transactionResponse.meta.postTokenBalances);
    // console.log(transactionResponse.transaction.message.accountKeys);
    // console.log(getMetadataNFT('2Sxvp7thwJVakdEJABh7L4TaCqi2U9fWSdSrJTViaULy'));
}

test();


app.listen();