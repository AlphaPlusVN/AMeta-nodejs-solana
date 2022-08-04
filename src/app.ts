import * as bodyParser from 'body-parser';
import { config } from "dotenv";
import * as express from 'express';
import path from "path";
import { connect } from './configdb/database.config';

config({ path: path.join(__dirname, "../config.env") });

var cors = require('cors')
class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: any[], app: express.Express) {
    this.app = app;
    // this.port = port;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(cors({
      origin: '*'
    }));
  }

  private initializeControllers(controllers: any[]) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }

  public listen() {
    this.app.listen(process.env.PORT || 5000, () => {
      console.log(`App listening on the port ${process.env.PORT || 5000}`);
    });
    connect().then(async () => {
      console.log("Database connected!");
      // let keyp = web3.Keypair.fromSecretKey(new Uint8Array([154, 212, 113, 246, 197, 36, 36, 96, 18, 46, 165, 108, 90, 213, 88, 249, 239, 65, 217, 73, 196, 234, 134, 109, 66, 12, 65, 76, 205, 89, 64, 80, 7, 33, 229, 52, 222, 191, 203, 112, 239, 186, 105, 139, 197, 62, 40, 101, 229, 150, 29, 132, 105, 77, 188, 227, 203, 209, 246, 236, 224, 190, 235, 147]));
      // console.log(keyp.publicKey + "     " + base58.encode(keyp.secretKey));
    });
  }
}

export default App;