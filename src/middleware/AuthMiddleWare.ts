import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { buildResponse, isNullOrEmptyString } from "../commons/Utils";
import { SECRET } from "../config/AuthConfig";
import { AUTH_FAILD } from "../config/ErrorCodeConfig";

class AuthMiddleWare {
    verifyToken = async (req: Request, res: Response, next: any) => {
        let authorization = req.headers.authorization;
        if(isNullOrEmptyString(authorization)){
            buildResponse(req.body.refNo, res, AUTH_FAILD, {});
            return;
        }
        let tokenSplit = authorization.split(' ');
        if(tokenSplit.length != 2){
            buildResponse(req.body.refNo, res, AUTH_FAILD, {});
            return;
        }
        let token = tokenSplit[1];
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