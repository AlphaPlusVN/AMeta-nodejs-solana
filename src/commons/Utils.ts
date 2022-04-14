import { Request, Response } from "express";
import { ResponseDic } from "../config/ErrorCodeConfig";

export const buildResponse = (refNo: string, res: Response, responseDic: ResponseDic, data: any, customMsg?: string) => {
    let responseObj = {
        refNo: refNo,
        responseCode: responseDic.responseCode,
        msg: customMsg ? customMsg : responseDic.msg,
        data: data
    }

    res.send(responseObj)
}

export const genRandomString = (length: number): string => {
    let result = '';
    const dic = 'qwertyuiopasdfghjklzxcvbnm0123456789';
    for (let i = 0; i < length; i++) {
        let randomIndex = Math.floor(Math.random() * dic.length);
        result = result + dic[randomIndex];
    }
    return result;
}

export const isNullOrEmptyString = (str: string | null | undefined) => {
    if (str == undefined) return true;
    if (str == null) return true;
    if (str.length == 0) return true;
  
    return false;
  };

  