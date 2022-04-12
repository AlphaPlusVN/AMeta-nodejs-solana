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


const appExpress: Express = express();
// const port = process.env.PORT;
const app = new App(
    [
        new AuthController(),
        new BoxController(),
        // new BoxForSaleController(),
    ],
    3000,
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

    // console.log(OuterNFT.generate('8f9G9mnpWw3m3zPaQxHAc4doqsqs5ctwakjo6mXGJKxb'))
    // console.log(OuterNFT.generate('8f9G9mnpWw3m3zPaQxHAc4doqsqs5ctwakjo6mXGJKxb'))
    // console.log(OuterNFT.generate('8f9G9mnpWw3m3zPaQxHAc4doqsqs5ctwakjo6mXGJKxb'))
    // console.log(OuterNFT.generate('8f9G9mnpWw3m3zPaQxHAc4doqsqs5ctwakjo6mXGJKxb'))
    // let ipfs = await create({
    //     host: 'ipfs.infura.io',
    //     port: 5001,
    //     protocol: 'https'
    // })
    // let data = OuterNFT.generate('8f9G9mnpWw3m3zPaQxHAc4doqsqs5ctwakjo6mXGJKxb');
    // let result = await ipfs.add({ path: `${data.name}.json`, content: JSON.stringify(data) });
    // console.log(result);
    // const message = new TextEncoder().encode('3004');
    // const sig =  bs58.decode('3NKH5T5iXNkjokHGG5NZma85ZscurAuJLAEoFknML7UDE3eNBEPsTFAhdCH1n5ZKy7ZmMQ7vM5CNpLFDa45sLFAh');
    // const wallet = new PublicKey('HHqTNVWPZU8mVTKY4XUPmmS6GJRVA77VdygHCZWJZ58p');
    
    // console.log(message, new Uint8Array(sig), wallet);
    // let verified = sign.detached.verify(message, new Uint8Array(sig), wallet.toBytes())
    // console.log(verified)


}

test();
// console.log(TransactionHelper.getTransaction('2jpLe4x8FQPfe1Edu5T3tiD78t45KPHkaUoEyiDPMhke9sSJeUSVHTZkU9vXSbc6v5zY1JrXqFuD1YMtPTqtP9bF'));

app.listen();