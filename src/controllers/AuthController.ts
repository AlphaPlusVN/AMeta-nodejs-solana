import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { buildResponse } from "../commons/Utils";
import { SECRET } from "../config/AuthConfig";
import { ErrorCode } from "../config/ErrorCodeConfig";
import BaseController, { BaseInput } from "./BaseController";

interface AuthInput extends BaseInput {

}

export default class AuthController extends BaseController {
    constructor() {
        super();
        this.intializeRoutes();
    }

    intializeRoutes = () => {
        this.router.post('/getToken', this.getToken)
    }

    getToken = (req: Request, res: Response) => {
        let input: AuthInput = req.body;
        let token = sign({ userId: 'outerspace' }, SECRET, {
            expiresIn: '365d' // 60 mins
        });

        buildResponse(input.refNo, res, ErrorCode.SUCCESS, 'ok', { token });
    }
}