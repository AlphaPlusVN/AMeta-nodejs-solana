import express, { Express, Request, Response } from 'express';

import App from './app';
import BoxController from './controllers/BoxController';

import AuthController from './controllers/AuthController';
import { buyBox, getProgram, initAMeta } from './ameta/SolAMeta';
import { AMetaData, findAssociatedTokenAddress, getAMeta, getMetadata, MY_WALLET, TOKEN_METADATA_PROGRAM_ID, validateBoxAddress } from './ameta/SolUtils';
import { BN, web3 } from '@project-serum/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
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
    
}

test();


app.listen();