import express, { Express, Request, Response } from 'express';

import App from './app';
import BoxController from './controllers/BoxController';

import AuthController from './controllers/AuthController';
import { initOuterSpace } from './outer-space/SolOuterSpace';
import { validateBoxAddress } from './outer-space/SolUtils';

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

// let test = async () => {
//     await validateBoxAddress('Ex1PGrbFm7NHJMoZ2VotTVX4Znms9kC6Cj7XqAvzUhGG2', 'HMdeNmvEKAfJHtDWHB82fk2Ddk7BHySZzQe1R5DRqevx');
// }

// test();


app.listen();