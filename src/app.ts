import * as express from 'express';
import * as bodyParser from 'body-parser';
 
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
  }
 
  private initializeControllers(controllers) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }
 
  public listen() {
    this.app.listen(process.env.PORT || 3000, () => {
      console.log(`App listening on the port ${process.env.PORT || 3000}`);
    });
  }
}
 
export default App;