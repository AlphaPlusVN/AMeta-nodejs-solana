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
app.listen();