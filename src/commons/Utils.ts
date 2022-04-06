import { Request, Response } from "express";

export const buildResponse = (refNo: string, res: Response, responseCode: string, msg: string, data: any) => {
    let responseObj = {
        refNo: refNo,
        responseCode: responseCode,
        msg: msg,
        data: data
    }
    
    res.send(responseObj)
}