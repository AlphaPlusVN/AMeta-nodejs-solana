import express, { Express, Request, Response } from 'express';
import * as anchor from '@project-serum/anchor';
import App from './app';
import BuyBoxController from './controllers/BuyBoxController';


const appExpress: Express = express();
// const port = process.env.PORT;
const app = new App(
    [
        new BuyBoxController()
    ],
    3000,
    appExpress
)

app.listen();