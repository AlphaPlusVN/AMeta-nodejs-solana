import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { buildResponse, isNullOrEmptyString } from "../commons/Utils";
import { SECRET } from "../config/AuthConfig";
import { AUTH_FAILED } from "../config/ErrorCodeConfig";

class AuthMiddleWare {
    verifyToken = async (req: Request, res: Response, next: any) => {
        let authorization = req.headers.authorization;
        if(isNullOrEmptyString(authorization)){
            buildResponse(req.body.refNo, res, AUTH_FAILED, {});
            return;
        }
        let tokenSplit = authorization.split(' ');
        if(tokenSplit.length != 2){
            buildResponse(req.body.refNo, res, AUTH_FAILED, {});
            return;
        }
        let token = tokenSplit[1];
        console.log(token);
        verify(token, SECRET, (err, decode) => {
            console.log('decode', decode)
            if (err) {
                // console.log(err)
                buildResponse(req.body.refNo, res, AUTH_FAILED, {});
                return;
            }
            //@ts-ignore
            const decodeWallet = decode.walletAddress;
            if(isNullOrEmptyString(decodeWallet)){
                buildResponse(req.body.refNo, res, AUTH_FAILED, {});
                return;
            }
            //@ts-ignore
            req.walletAddress = decodeWallet;
            
            next();
        });
    }
}

export default new AuthMiddleWare();