import express, { Express, Request, Response } from 'express';
import * as anchor from '@project-serum/anchor';
import App from './app';
import BoxController from './controllers/BoxController';
import TransactionController from './commons/TransactionHelper';
import AuthController from './controllers/AuthController';
import TransactionHelper from './commons/TransactionHelper';
import { MktTransaction } from './models/MktTransaction';
import { collection } from './commons/mongo';

import { createHash } from 'crypto';
import OuterNFT from './outer-space/OuterNFT';
import { create } from 'ipfs-http-client';
import { sign } from 'tweetnacl';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { PublicKey } from '@solana/web3.js';
import { genRandomString } from './commons/Utils';
import BoxNFT from './outer-space/BoxNFT';


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

let test = async () => {
    // console.log(await TransactionHelper.isValidTransferTokenSig(
    //     '2jpLe4x8FQPfe1Edu5T3tiD78t45KPHkaUoEyiDPMhke9sSJeUSVHTZkU9vXSbc6v5zY1JrXqFuD1YMtPTqtP9bF',
    //     '8f9G9mnpWw3m3zPaQxHAc4doqsqs5ctwakjo6mXGJKxb',
    //     1234
    // ))
    // console.log(await TransactionHelper.isValidTransferTokenSig(
    //     '2jpLe4x8FQPfe1Edu5T3tiD78t45KPHkaUoEyiDPMhke9sSJeUSVHTZkU9vXSbc6v5zY1JrXqFuD1YMtPTqtP9bF',
    //     '8f9G9mnpWw3m3zPaQxHAc4doqsqs5ctwakjo6mXGJKxb2',
    //     1234
    // ))
    // console.log(await TransactionHelper.isValidTransferTokenSig(
    //     '2jpLe4x8FQPfe1Edu5T3tiD78t45KPHkaUoEyiDPMhke9sSJeUSVHTZkU9vXSbc6v5zY1JrXqFuD1YMtPTqtP9bF',
    //     '8f9G9mnpWw3m3zPaQxHAc4doqsqs5ctwakjo6mXGJKxb',
    //     1233
    // ))
    // let mkt_transaction = await collection('mkt_transaction');
    // let transaction = await mkt_transaction.findOne();
    // console.log('transaction', transaction);

    // let boxNft = new BoxNFT();
    // let data = await boxNft.generate('8f9G9mnpWw3m3zPaQxHAc4doqsqs5ctwakjo6mXGJKxb');
    // boxNft.upload();


}

test();
// console.log(TransactionHelper.getTransaction('2jpLe4x8FQPfe1Edu5T3tiD78t45KPHkaUoEyiDPMhke9sSJeUSVHTZkU9vXSbc6v5zY1JrXqFuD1YMtPTqtP9bF'));

app.listen();