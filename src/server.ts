import express, { Express, Request, Response } from 'express';

import App from './app';
import BoxController from './controllers/BoxController';

import AuthController from './controllers/AuthController';
import ItemController from './controllers/ItemController';

const appExpress: Express = express();
// const port = process.env.PORT;
const app = new App(
    [
        new AuthController(),
        new BoxController(),
        new ItemController()
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