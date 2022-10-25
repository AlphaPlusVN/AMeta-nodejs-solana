import express from "express";;

export interface BaseInput {
    refNo: string,

}
export default abstract class BaseController {

    public router = express.Router();
    public abstract initializeRoutes: () => void;

}