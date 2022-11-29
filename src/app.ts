import { config } from "dotenv";
import * as express from 'express';
import path from "path";
import { BscUtil } from "./commons/BSCUtils";
import { KardiaUtils } from "./commons/KardiaUtils";
import logger from "./commons/logger";
import { connect } from './configdb/database.config';
import { initSchedule } from "./schedule/ScheduleConfig";
import { initConstructEvent } from "./service/ContractEventHandler";

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
    this.app.use(express.json());
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
      logger.info(`App listening on the port ${process.env.PORT || 5000}`);
    });
    connect().then(async () => {
      logger.info("Database connected!");
    });

    initConstructEvent();
    initSchedule();
  };
}

export default App;