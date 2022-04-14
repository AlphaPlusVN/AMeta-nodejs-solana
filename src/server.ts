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
import { create, urlSource } from 'ipfs-http-client';
import { sign } from 'tweetnacl';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { PublicKey } from '@solana/web3.js';
import { genRandomString } from './commons/Utils';
import BoxNFT from './outer-space/BoxNFT';

import { readFileSync } from 'fs'
import { getProgram } from './outer-space/SolOuterSpace';
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
    // let ipfs = await create({
    //     host: 'ipfs.infura.io',
    //     port: 5001,
    //     protocol: 'https'
    // })
    // // console.log(__dirname);
    // const img =readFileSync(__dirname + '/outer.png');
    // console.log(img);
    // // let data = OuterNFT.generate('8f9G9mnpWw3m3zPaQxHAc4doqsqs5ctwakjo6mXGJKxb');
    // let result = await ipfs.add(img);
    // console.log(result);

    // let outer = new OuterNFT();
    // let data = await outer.generate('8f9G9mnpWw3m3zPaQxHAc4doqsqs5ctwakjo6mXGJKxb');
    // await outer.upload();
    console.log(getProgram());
}

test();
// console.log(TransactionHelper.getTransaction('2jpLe4x8FQPfe1Edu5T3tiD78t45KPHkaUoEyiDPMhke9sSJeUSVHTZkU9vXSbc6v5zY1JrXqFuD1YMtPTqtP9bF'));

app.listen();