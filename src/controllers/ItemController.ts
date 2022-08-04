import BaseController from './BaseController';
class ItemController extends BaseController {
    constructor() {
        super();
        this.initializeRoutes();
    }

    public initializeRoutes = () => {
        this.router.post("/")
    }

}
