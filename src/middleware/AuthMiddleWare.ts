import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { buildResponse } from "../commons/Utils";
import { SECRET } from "../config/AuthConfig";
import { AUTH_FAILD } from "../config/ErrorCodeConfig";

class AuthMiddleWare {
    verifyToken = async (req: Request, res: Response, next: any) => {
        let token = req.body.token;
        console.log(token);
        verify(token, SECRET, (err, decode) => {
            if (err) {
                // console.log(err)
                buildResponse(req.body.refNo, res, AUTH_FAILD, {});
                return;
            }

            console.log(decode)
            next();
        });
    }
}

export default new AuthMiddleWare();